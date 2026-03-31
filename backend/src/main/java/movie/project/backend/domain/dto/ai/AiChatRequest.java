package movie.project.backend.domain.dto.ai;

import java.util.List;

public record AiChatRequest(String message, List<ChatMessage> messages) {

    public record ChatMessage(String role, String content) {
    }
}
