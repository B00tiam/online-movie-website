package movie.project.backend.service;


import movie.project.backend.domain.Movie;
import movie.project.backend.domain.Review;
import movie.project.backend.domain.User;
import movie.project.backend.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;



@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    public Review createReview(String reviewBody, String imdbId) {
        // get current user
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // insert the review (contains user info)
        Review review = reviewRepository.insert(new Review(reviewBody, currentUser.getId(), currentUser.getUsername()));

        // update mongo database
        mongoTemplate.update(Movie.class)
                .matching(Criteria.where("imdbId").is(imdbId))
                .apply(new Update().push("reviewIds").value(review.getId()))
                .first();

        return review;
    }
}
