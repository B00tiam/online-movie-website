package movie.project.backend.domain.dto;

import lombok.Data;



@Data
public class UpdateProfileRequest {
    private String birthday;    // format: "yyyy-MM-dd", nullable
    private String gender;      // nullable
}
