package movie.project.backend.domain.dto.ai;

import java.util.List;


public record AiChatResponse(String reply, List<LocalMovieSnippet> movies) {
}
