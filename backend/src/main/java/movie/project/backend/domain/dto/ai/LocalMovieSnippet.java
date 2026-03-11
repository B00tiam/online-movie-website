package movie.project.backend.domain.dto.ai;

import java.util.List;

public record LocalMovieSnippet(
        String imdbId,
        String title,
        String releaseDate,
        List<String> genres,
        String poster
) {
}