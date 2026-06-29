package movie.project.backend.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;



@Data
@AllArgsConstructor
public class ProfileResponse {
    private String username;
    private String email;
    private String role;        // USER / ADMIN
    private String birthday;    // yyyy-MM-dd
    private String gender;      // male / female / other
}
