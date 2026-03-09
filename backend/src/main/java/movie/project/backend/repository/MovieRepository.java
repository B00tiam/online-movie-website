package movie.project.backend.repository;

import movie.project.backend.domain.Movie;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface MovieRepository extends MongoRepository<Movie, ObjectId> {

    // using imdbId to find movie
    Optional<Movie> findMovieByImdbId(String imdbId);

    // using genres to find movies
    List<Movie> findByGenresContainingOrderByReleaseDateDesc(String genre);

    // using title to find movies
    List<Movie> findByTitleContainingIgnoreCaseOrderByReleaseDateDesc(String title);

}
