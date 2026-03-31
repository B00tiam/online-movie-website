package movie.project.backend.service.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import movie.project.backend.domain.Movie;
import movie.project.backend.domain.dto.ai.AiChatRequest;
import movie.project.backend.domain.dto.ai.LocalMovieSnippet;
import movie.project.backend.service.MovieService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AiChatService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final MovieService movieService;

    private final String baseUrl;
    private final String apiKey;
    private final String model;

    public AiChatService(
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper,
            MovieService movieService,
            @Value("${ai.base-url}") String baseUrl,
            @Value("${ai.api-key}") String apiKey,
            @Value("${ai.model}") String model
    ) {
        this.restClient = restClientBuilder.build();
        this.objectMapper = objectMapper;
        this.movieService = movieService;
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.model = model;
    }

    public String chat(String userMessage) {
        String url = buildGeminiUrl();

        // Step 1: ask model to either call a tool or return final answer
        String step1Prompt = buildStep1Prompt(userMessage);
        String step1Raw = callModel(url, step1Prompt);

        AgentModelOutput out = parseAgentOutput(step1Raw);
        if (out == null) {
            // Fallback: keep existing behavior (no agent)
            return safeTextReply(step1Raw);
        }

        if ("final".equalsIgnoreCase(out.type)) {
            return out.reply == null || out.reply.isBlank() ? safeTextReply(step1Raw) : out.reply;
        }

        if (!"tool_call".equalsIgnoreCase(out.type) || out.tool == null) {
            return safeTextReply(step1Raw);
        }

        if (!"search_movies".equalsIgnoreCase(out.tool)) {
            // Allowlist: only one tool for phase 1
            return safeTextReply(step1Raw);
        }

        ToolCallArgs args = out.args == null ? new ToolCallArgs(null, null, null) : out.args;
        ToolResult toolResult = runSearchTool(args);

        // Step 2: provide tool result and ask for final response
        String step2Prompt = buildStep2Prompt(userMessage, out, toolResult);
        String step2Raw = callModel(url, step2Prompt);

        AgentModelOutput out2 = parseAgentOutput(step2Raw);
        if (out2 != null && "final".equalsIgnoreCase(out2.type) && out2.reply != null && !out2.reply.isBlank()) {
            return out2.reply;
        }

        return safeTextReply(step2Raw);
    }

    public String chat(List<AiChatRequest.ChatMessage> messages) {
        String url = buildGeminiUrl();

        List<Map<String, Object>> step1Contents = concatContents(
                List.of(asGeminiContent("user", buildStep1Instruction())),
                toGeminiContents(messages)
        );

        String step1Raw = callModel(url, step1Contents);
        AgentModelOutput out = parseAgentOutput(step1Raw);
        if (out == null) {
            return safeTextReply(step1Raw);
        }

        if ("final".equalsIgnoreCase(out.type)) {
            return out.reply == null || out.reply.isBlank() ? safeTextReply(step1Raw) : out.reply;
        }

        if (!"tool_call".equalsIgnoreCase(out.type) || out.tool == null) {
            return safeTextReply(step1Raw);
        }

        if (!"search_movies".equalsIgnoreCase(out.tool)) {
            return safeTextReply(step1Raw);
        }

        ToolCallArgs args = out.args == null ? new ToolCallArgs(null, null, null) : out.args;
        ToolResult toolResult = runSearchTool(args);

        String toolBundle = "Tool call:\n" + toJsonSafe(out) + "\n\nTOOL_RESULT:\n" + toJsonSafe(toolResult);

        List<Map<String, Object>> step2Contents = concatContents(
                concatContents(
                        List.of(asGeminiContent("user", buildStep2Instruction())),
                        toGeminiContents(messages)
                ),
                List.of(asGeminiContent("user", toolBundle))
        );

        String step2Raw = callModel(url, step2Contents);
        AgentModelOutput out2 = parseAgentOutput(step2Raw);
        if (out2 != null && "final".equalsIgnoreCase(out2.type) && out2.reply != null && !out2.reply.isBlank()) {
            return out2.reply;
        }
        return safeTextReply(step2Raw);
    }

    private String buildGeminiUrl() {
        String normalizedBase = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        return normalizedBase
                + "/models/" + URLEncoder.encode(model, StandardCharsets.UTF_8)
                + ":generateContent?key=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8);
    }

    private String callModel(String url, String prompt) {
        Map<String, Object> payload = Map.of(
                "contents", List.of(
                        Map.of(
                                "role", "user",
                                "parts", List.of(Map.of("text", prompt))
                        )
                ),
                "generationConfig", Map.of(
                        "temperature", 0.3
                )
        );

        return restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(String.class);
    }

    private String callModel(String url, List<Map<String, Object>> contents) {
        Map<String, Object> payload = Map.of(
                "contents", contents,
                "generationConfig", Map.of(
                        "temperature", 0.3
                )
        );

        return restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(String.class);
    }

    private String buildStep1Prompt(String userMessage) {
        // No Chinese in code: keep instructions in English
        return """
                You are an AI agent for a movie website. Your job is to decide whether to call a tool to search the local movie database.

                Output MUST be a single JSON object only (no markdown, no extra text).

                Allowed tools:
                1) search_movies(args):
                   - mode: "title" or "genre"
                   - query: string (required)
                   - limit: integer (optional, max 20)

                If the user asks to recommend or find movies by a genre (e.g. science fiction, action, comedy), call search_movies with mode="genre".
                Otherwise, if the user asks for a specific movie name, call search_movies with mode="title".

                JSON schemas:
                - Tool call:
                  {"type":"tool_call","tool":"search_movies","args":{"mode":"title|genre","query":"...","limit":10}}
                - Final answer:
                  {"type":"final","reply":"..."}

                User message:
                """.strip() + "\n" + (userMessage == null ? "" : userMessage.trim());
    }

    private String buildStep2Prompt(String userMessage, AgentModelOutput step1, ToolResult toolResult) {
        String toolJson = toJsonSafe(toolResult);
        return """
                You are an AI agent for a movie website.

                You previously decided to call a tool. Now you must produce the final answer.
                Output MUST be a single JSON object only (no markdown, no extra text).

                JSON schema:
                {"type":"final","reply":"..."}

                User message:
                """.strip() + "\n" + (userMessage == null ? "" : userMessage.trim())
                + "\n\nTool call:\n" + toJsonSafe(step1)
                + "\n\nTOOL_RESULT:\n" + toolJson;
    }

    private String buildStep1Instruction() {
        return """
                You are an AI agent for a movie website. Your job is to decide whether to call a tool to search the local movie database.

                Output MUST be a single JSON object only (no markdown, no extra text).

                Allowed tools:
                1) search_movies(args):
                   - mode: "title" or "genre"
                   - query: string (required)
                   - limit: integer (optional, max 20)

                If the user asks to recommend or find movies by a genre (e.g. science fiction, action, comedy), call search_movies with mode="genre".
                Otherwise, if the user asks for a specific movie name, call search_movies with mode="title".

                JSON schemas:
                - Tool call:
                  {"type":"tool_call","tool":"search_movies","args":{"mode":"title|genre","query":"...","limit":10}}
                - Final answer:
                  {"type":"final","reply":"..."}
                """.strip();
    }

    private String buildStep2Instruction() {
        return """
                You are an AI agent for a movie website.

                You previously decided to call a tool. Now you must produce the final answer.
                Output MUST be a single JSON object only (no markdown, no extra text).

                JSON schema:
                {"type":"final","reply":"..."}
                """.strip();
    }

    private Map<String, Object> asGeminiContent(String role, String text) {
        return Map.of(
                "role", role,
                "parts", List.of(Map.of("text", text == null ? "" : text))
        );
    }

    private List<Map<String, Object>> toGeminiContents(List<AiChatRequest.ChatMessage> messages) {
        if (messages == null || messages.isEmpty()) return List.of();
        return messages.stream()
                .filter(m -> m != null && m.content() != null && !m.content().isBlank())
                .map(m -> asGeminiContent(normalizeGeminiRole(m.role()), m.content().trim()))
                .toList();
    }

    private String normalizeGeminiRole(String role) {
        if (role == null) return "user";
        String r = role.trim().toLowerCase(Locale.ROOT);
        if ("assistant".equals(r) || "model".equals(r)) return "model";
        return "user";
    }

    private List<Map<String, Object>> concatContents(List<Map<String, Object>> a, List<Map<String, Object>> b) {
        if (a == null || a.isEmpty()) return b == null ? List.of() : b;
        if (b == null || b.isEmpty()) return a;
        return java.util.stream.Stream.concat(a.stream(), b.stream()).toList();
    }

    private ToolResult runSearchTool(ToolCallArgs args) {
        String mode = args.mode == null ? "title" : args.mode.trim().toLowerCase(Locale.ROOT);
        int limit = args.limit == null ? 10 : Math.min(Math.max(args.limit, 1), 20);

        String q = args.query == null ? "" : args.query.trim();
        if (q.isEmpty()) {
            return new ToolResult("search_movies", mode, q, limit, List.of(), "empty_query");
        }

        List<Movie> found;
        if ("genre".equals(mode)) {
            String normalizedGenre = normalizeGenreQuery(q);
            found = movieService.moviesByGenreLatestFirst(normalizedGenre);
        } else {
            found = movieService.searchMovies(q);
        }

        List<LocalMovieSnippet> items = (found == null ? List.<Movie>of() : found).stream()
                .limit(limit)
                .map(m -> new LocalMovieSnippet(
                        m.getImdbId(),
                        m.getTitle(),
                        m.getReleaseDate(),
                        m.getGenres(),
                        m.getPoster()
                ))
                .toList();

        return new ToolResult("search_movies", mode, q, limit, items, null);
    }

    private String normalizeGenreQuery(String q) {
        // Map common inputs to your existing UI genre names (Header.js).
        // Keep strings in English only.
        String s = q.toLowerCase(Locale.ROOT).trim();

        // science fiction, sci-fi, sci fi, sci-fi
        if (s.contains("science") && s.contains("fiction")) return "Science Fiction";
        if (s.contains("sci") && s.contains("fi")) return "Science Fiction";

        if (s.contains("action")) return "Action";
        if (s.contains("adventure")) return "Adventure";
        if (s.contains("comedy")) return "Comedy";
        if (s.contains("fantasy")) return "Fantasy";
        if (s.contains("horror")) return "Horror";
        if (s.contains("animation")) return "Animation";
        if (s.contains("family")) return "Family";
        if (s.contains("drama")) return "Drama";

        // Fallback: pass through, since repository uses "containing"
        // but note: "Science Fiction" vs "Sci-Fi" must match your stored genres.
        return q.trim();
    }

    private AgentModelOutput parseAgentOutput(String rawModelResponse) {
        String text = extractTextFromGeminiResponse(rawModelResponse);
        if (text == null || text.isBlank()) return null;

        String json = extractFirstJsonObject(text);
        if (json == null) return null;

        try {
            return objectMapper.readValue(json, AgentModelOutput.class);
        } catch (Exception e) {
            return null;
        }
    }

    private String safeTextReply(String rawModelResponse) {
        String text = extractTextFromGeminiResponse(rawModelResponse);
        if (text == null || text.isBlank()) {
            return "I haven't received the model response yet. Please try again later.";
        }
        return text;
    }

    private String extractTextFromGeminiResponse(String raw) {
        if (raw == null || raw.isBlank()) return null;
        try {
            JsonNode root = objectMapper.readTree(raw);
            JsonNode textNode = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");
            return textNode.isMissingNode() ? null : textNode.asText();
        } catch (Exception e) {
            return null;
        }
    }

    private String extractFirstJsonObject(String text) {
        // Minimal JSON object extraction: find the first {...} block.
        // Works for typical "single JSON object" responses; keeps implementation simple.
        Pattern p = Pattern.compile("\\{[\\s\\S]*\\}");
        Matcher m = p.matcher(text);
        return m.find() ? m.group() : null;
    }

    private String toJsonSafe(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            return "{}";
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AgentModelOutput {
        public String type;          // "tool_call" | "final"
        public String tool;          // e.g. "search_movies"
        public ToolCallArgs args;    // tool args
        public String reply;         // final reply
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ToolCallArgs {
        public String mode;   // "title" | "genre"
        public String query;
        public Integer limit;

        public ToolCallArgs() {
        }

        public ToolCallArgs(String mode, String query, Integer limit) {
            this.mode = mode;
            this.query = query;
            this.limit = limit;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ToolResult {
        public String tool;
        public String mode;
        public String query;
        public int limit;
        public List<LocalMovieSnippet> items;
        public String error;

        public ToolResult() {
        }

        public ToolResult(String tool, String mode, String query, int limit, List<LocalMovieSnippet> items, String error) {
            this.tool = tool;
            this.mode = mode;
            this.query = query;
            this.limit = limit;
            this.items = items;
            this.error = error;
        }
    }
}
