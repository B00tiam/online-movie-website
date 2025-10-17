package movie.project.backend.domain.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class LoginRequest {
    
    @NotBlank(message = "Username or email cannot be empty!")
    private String usernameOrEmail;
    
    @NotBlank(message = "Password cannot be empty!")
    private String password;
}
