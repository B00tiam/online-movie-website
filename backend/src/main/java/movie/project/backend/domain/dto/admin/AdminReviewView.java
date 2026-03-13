package movie.project.backend.domain.dto.admin;

import lombok.Data;

@Data
public class AdminReviewView {
    private String id;
    private String imdbId;        // related movie
    private String userId;        // author ID of the review
    private String username;      // saved username
    private String body;          // content of the review
    private String createdAt;     // created date
}
