package movie.project.backend.service.admin;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Component
public class TmdbClient {

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper;

    @Value("${tmdb.api.key}")
    private String apiKey;

    @Value("${tmdb.api.baseUrl}")
    private String baseUrl;

    public TmdbClient(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public JsonNode fetchMovieDetails(long tmdbId) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "TMDB api key not configured");
        }

        String url = baseUrl + "/movie/" + tmdbId
                + "?api_key=" + urlEncode(apiKey)
                + "&language=" + urlEncode("en-US")
                + "&append_to_response=" + urlEncode("videos,images")
                + "&include_image_language=" + urlEncode("en,null");

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .build();

        try {
            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() == 404) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "TMDB movie not found: " + tmdbId);
            }
            if (resp.statusCode() < 200 || resp.statusCode() >= 300) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "TMDB error: " + resp.statusCode());
            }
            return objectMapper.readTree(resp.body());
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to call TMDB", e);
        }
    }

    private static String urlEncode(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }
}
