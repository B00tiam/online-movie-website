package movie.project.backend.domain.dto.admin;

import lombok.Data;

@Data
public class AdminUserView {
    private String id;
    private String username;
    private String email;
    private String role;
    private boolean enabled;
}
