package movie.project.backend.controller.ai;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import movie.project.backend.domain.dto.ai.AiChatRequest;
import movie.project.backend.domain.dto.ai.AiChatResponse;
import movie.project.backend.service.ai.AiChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {

    private final AiChatService aiChatService;

    public AiController(AiChatService aiChatService) {
        this.aiChatService = aiChatService;
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@Valid @RequestBody AiChatRequest request) {
        if (request == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("request cannot be null!"));
        }

        List<AiChatRequest.ChatMessage> messages = request.messages();
        if (messages != null && !messages.isEmpty()) {
            boolean hasAnyNonBlank = messages.stream()
                    .anyMatch(m -> m != null && m.content() != null && !m.content().isBlank());
            if (!hasAnyNonBlank) {
                return ResponseEntity.badRequest().body(new ErrorResponse("messages cannot be empty or blank!"));
            }
            String reply = aiChatService.chat(messages);
            return ResponseEntity.ok(new AiChatResponse(reply));
        }

        String msg = request.message();
        if (msg == null || msg.isBlank()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("message cannot be empty or blank!"));
        }

        String reply = aiChatService.chat(msg);
        return ResponseEntity.ok(new AiChatResponse(reply));
    }

    public static class ErrorResponse {
        @NotBlank
        private String message;

        public ErrorResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
