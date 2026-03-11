package movie.project.backend.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import movie.project.backend.domain.Movie;
import movie.project.backend.domain.dto.ai.LocalMovieSnippet;
import movie.project.backend.service.MovieService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

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
        String normalizedBase = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        String url = normalizedBase
                + "/models/" + URLEncoder.encode(model, StandardCharsets.UTF_8)
                + ":generateContent?key=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8);

        List<LocalMovieSnippet> localMovies = searchLocalMoviesForContext(userMessage, 10);

        String instruction =
                "You are the AI assistant for this movie website. " +
                "Please respond in a concise and friendly tone, and provide actionable suggestions whenever possible. " +
                "When answering questions about what exists in the local movie library, rely only on LOCAL_MOVIES. " +
                "If LOCAL_MOVIES is empty or insufficient, say you cannot find enough information in the local library and ask for more details.";

        String localContext = toJsonSafe(localMovies);

        String prompt = instruction
                + "\n\nLOCAL_MOVIES:\n" + localContext
                + "\n\nUser Question:\n" + userMessage;

        Map<String, Object> payload = Map.of(
                "contents", List.of(
                        Map.of(
                                "role", "user",
                                "parts", List.of(Map.of("text", prompt))
                        )
                ),
                "generationConfig", Map.of(
                        "temperature", 0.7
                )
        );

        String raw = restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(String.class);

        try {
            JsonNode root = objectMapper.readTree(raw);
            JsonNode textNode = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");

            String reply = textNode.isMissingNode() ? null : textNode.asText();
            return (reply == null || reply.isBlank())
                    ? "I haven't received the model response yet. Please try again later."
                    : reply;
        } catch (Exception e) {
            return "Model parsing failed. Please try again later.";
        }
    }

    private List<LocalMovieSnippet> searchLocalMoviesForContext(String userMessage, int limit) {
        String keyword = extractSearchKeyword(userMessage);
        if (keyword == null || keyword.isBlank()) {
            return List.of();
        }

        List<Movie> found = movieService.searchMovies(keyword);
        if (found == null || found.isEmpty()) {
            return List.of();
        }

        int capped = Math.min(Math.max(limit, 1), 20);
        return found.stream()
                .limit(capped)
                .map(m -> new LocalMovieSnippet(
                        m.getImdbId(),
                        m.getTitle(),
                        m.getReleaseDate(),
                        m.getGenres(),
                        m.getPoster()
                ))
                .toList();
    }

    private String extractSearchKeyword(String userMessage) {
        if (userMessage == null) return null;
        String s = userMessage.trim();
        if (s.isEmpty()) return null;

        // Keep it cheap and safe:
        // - Avoid triggering "return all movies" behavior in MovieService.searchMovies(null/empty)
        // - Cap length to prevent huge DB queries and prompt injection via extremely long input
        if (s.length() > 80) {
            s = s.substring(0, 80).trim();
        }

        // If the message contains any non-whitespace, use it as the keyword.
        // This works for both ASCII and non-ASCII titles without hardcoding any language keywords.
        return s.isEmpty() ? null : s;
    }

    private String toJsonSafe(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            return "[]";
        }
    }
}
