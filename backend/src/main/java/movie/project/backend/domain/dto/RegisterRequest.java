package movie.project.backend.domain.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class RegisterRequest {
    

    @NotBlank(message = "Username cannot be empty!")
    @Size(min = 3, max = 20, message = "Username length must be 3-20 characters!")
    private String username;

    @NotBlank(message = "Email cannot be empty!")
    @Email(message = "Email format incorrect!")
    private String email;

    @NotBlank(message = "Password cannot be empty!")
    @Size(min = 6, message = "Password length shall not be less than 6 characters!")
    private String password;

}
