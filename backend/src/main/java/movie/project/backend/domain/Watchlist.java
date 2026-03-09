package movie.project.backend.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "watchlist")
@CompoundIndex(
        name = "uniq_user_movie",
        def = "{'userId': 1, 'imdbId': 1}",
        unique = true
)
public class Watchlist {

    @Id
    private String id;

    private String userId;

    private String imdbId;

    private LocalDateTime createdAt = LocalDateTime.now();
}
