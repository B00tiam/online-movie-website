package movie.project.backend.repository;


import movie.project.backend.domain.Review;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface ReviewRepository extends MongoRepository<Review, ObjectId> {

    List<Review> findAllByOrderByCreatedAtDesc();
}
