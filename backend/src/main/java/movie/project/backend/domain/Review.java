package movie.project.backend.domain;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "reviews")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Review {

    @Id
    private ObjectId id;

    private String body;

    private String userId;

    private String username;

    private LocalDateTime createdAt;

    public Review(String body, String userId, String username) {
        this.body = body;
        this.userId = userId;
        this.username = username;
        this.createdAt = LocalDateTime.now();

    }
}
