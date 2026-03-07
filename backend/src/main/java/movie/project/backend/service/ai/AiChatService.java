package movie.project.backend.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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

    private final String baseUrl;
    private final String apiKey;
    private final String model;

    public AiChatService(
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper,
            @Value("${ai.base-url}") String baseUrl,
            @Value("${ai.api-key}") String apiKey,
            @Value("${ai.model}") String model
    ) {
        this.restClient = restClientBuilder.build();
        this.objectMapper = objectMapper;
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.model = model;
    }

    public String chat(String userMessage) {
        // Gemini: POST {baseUrl}/models/{model}:generateContent?key=API_KEY
        String normalizedBase = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        String url = normalizedBase
                + "/models/" + URLEncoder.encode(model, StandardCharsets.UTF_8)
                + ":generateContent?key=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8);

        String instruction = "You are the AI assistant for this movie website. " +
                "Please respond in a concise and friendly tone, and provide actionable suggestions whenever possible.";

        String prompt = instruction + "\n\nUser Question: \n" + userMessage;

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
}
