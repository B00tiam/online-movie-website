package movie.project.backend.domain.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SetUserRoleRequest {
    @NotBlank
    private String role; // USER / ADMIN
}
