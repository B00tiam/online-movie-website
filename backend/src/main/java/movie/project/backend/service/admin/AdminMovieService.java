package movie.project.backend.service.admin;

import com.fasterxml.jackson.databind.JsonNode;
import movie.project.backend.domain.Movie;
import movie.project.backend.domain.Review;
import movie.project.backend.repository.MovieRepository;
import movie.project.backend.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class AdminMovieService {

    private final MovieRepository movieRepository;
    private final ReviewRepository reviewRepository;
    private final TmdbClient tmdbClient;

    @Value("${tmdb.image.baseW500}")
    private String imageBaseW500;

    @Value("${tmdb.image.baseOriginal}")
    private String imageBaseOriginal;

    public AdminMovieService(MovieRepository movieRepository,
                             ReviewRepository reviewRepository,
                             TmdbClient tmdbClient) {
        this.movieRepository = movieRepository;
        this.reviewRepository = reviewRepository;
        this.tmdbClient = tmdbClient;
    }

    public List<Movie> list(String q) {
        if (q == null || q.isBlank()) {
            List<Movie> all = movieRepository.findAll();
            all.sort(Comparator.comparing(Movie::getReleaseDate, Comparator.nullsLast(Comparator.naturalOrder())).reversed());
            return all;
        }
        return movieRepository.findByTitleContainingIgnoreCaseOrderByReleaseDateDesc(q.trim());
    }

    public Movie importFromTmdb(long tmdbId) {
        JsonNode data = tmdbClient.fetchMovieDetails(tmdbId);

        String imdbId = text(data, "imdb_id");
        if (imdbId == null || imdbId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "TMDB movie has no imdb_id: " + tmdbId);
        }

        movieRepository.findMovieByImdbId(imdbId).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Movie already exists: " + imdbId);
        });

        Movie m = new Movie();
        m.setImdbId(imdbId);
        m.setTitle(firstNonBlank(text(data, "title"), text(data, "name")));
        m.setReleaseDate(text(data, "release_date"));
        m.setTrailerLink(extractTrailerLink(data.path("videos")));
        m.setPoster(extractPosterUrl(data));
        m.setBackdrops(extractBackdrops(data.path("images")));
        m.setGenres(extractGenres(data.path("genres")));

        // temporarily, director is not available in TMDB
        // m.setDirector(null);

        // Movie.reviewIds is a @DocumentReference List<Review>, so we set it to empty initially
        m.setReviewIds(List.of());

        return movieRepository.save(m);
    }

    @Transactional
    public void deleteByImdbId(String imdbId) {
        Movie m = movieRepository.findMovieByImdbId(imdbId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found: " + imdbId));

        List<Review> refs = m.getReviewIds();
        if (refs != null && !refs.isEmpty()) {
            reviewRepository.deleteAll(refs);
        }

        movieRepository.delete(m);
    }

    private String extractPosterUrl(JsonNode data) {
        String posterPath = text(data, "poster_path");
        if (posterPath == null || posterPath.isBlank()) return null;
        return imageBaseW500 + posterPath;
    }

    private List<String> extractBackdrops(JsonNode imagesNode) {
        List<String> out = new ArrayList<>();
        JsonNode backdrops = imagesNode.path("backdrops");
        if (backdrops.isArray()) {
            int limit = 10;
            for (JsonNode b : backdrops) {
                if (out.size() >= limit) break;
                String fp = b.path("file_path").asText(null);
                if (fp != null && !fp.isBlank()) {
                    out.add(imageBaseOriginal + fp);
                }
            }
        }
        return out;
    }

    private List<String> extractGenres(JsonNode genresNode) {
        List<String> out = new ArrayList<>();
        if (genresNode.isArray()) {
            for (JsonNode g : genresNode) {
                String name = g.path("name").asText(null);
                if (name != null && !name.isBlank()) out.add(name);
            }
        }
        return out;
    }

    private String extractTrailerLink(JsonNode videosNode) {
        JsonNode results = videosNode.path("results");
        if (!results.isArray() || results.isEmpty()) return null;

        JsonNode best = null;
        int bestScore = Integer.MIN_VALUE;

        for (JsonNode v : results) {
            int score = 0;
            String site = v.path("site").asText("");
            String type = v.path("type").asText("");
            boolean official = v.path("official").asBoolean(false);

            if ("YouTube".equals(site)) score += 10;
            if ("Trailer".equals(type)) score += 5;
            if (official) score += 3;

            if (score > bestScore) {
                bestScore = score;
                best = v;
            }
        }

        if (best == null) return null;
        if (!"YouTube".equals(best.path("site").asText(""))) return null;

        String key = best.path("key").asText(null);
        if (key == null || key.isBlank()) return null;

        return "https://www.youtube.com/watch?v=" + key;
    }

    private static String text(JsonNode node, String field) {
        JsonNode v = node.get(field);
        return (v == null || v.isNull()) ? null : v.asText();
    }

    private static String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) return a;
        if (b != null && !b.isBlank()) return b;
        return null;
    }
}
