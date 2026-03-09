package movie.project.backend.repository;

import movie.project.backend.domain.Watchlist;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;


public interface WatchlistRepository extends MongoRepository<Watchlist, String> {

    List<Watchlist> findByUserIdOrderByCreatedAtDesc(String userId);

    Optional<Watchlist> findByUserIdAndImdbId(String userId, String imdbId);

    boolean existsByUserIdAndImdbId(String userId, String imdbId);

    void deleteByUserIdAndImdbId(String userId, String imdbId);
}
