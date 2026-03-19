package movie.project.backend.service.admin;

import movie.project.backend.domain.Movie;
import movie.project.backend.domain.Review;
import movie.project.backend.domain.dto.admin.AdminReviewView;
import movie.project.backend.repository.MovieRepository;
import movie.project.backend.repository.ReviewRepository;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class AdminReviewService {

    private final ReviewRepository reviewRepository;
    private final MovieRepository movieRepository;
    private final MongoTemplate mongoTemplate;

    public AdminReviewService(ReviewRepository reviewRepository,
                              MovieRepository movieRepository,
                              MongoTemplate mongoTemplate) {
        this.reviewRepository = reviewRepository;
        this.movieRepository = movieRepository;
        this.mongoTemplate = mongoTemplate;
    }

    // - list reviews
    public List<AdminReviewView> list(String imdbId) {
        // filter by movie
        if (imdbId != null && !imdbId.isBlank()) {
            Movie m = movieRepository.findMovieByImdbId(imdbId)
                    .orElseThrow(() -> new IllegalArgumentException("Movie not found: " + imdbId));

            List<Review> reviews = m.getReviewIds() == null ? List.of() : m.getReviewIds();

            return reviews.stream()
                    .sorted(Comparator.comparing(Review::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                    .map(r -> toView(r, m.getImdbId()))
                    .toList();
        }

        // all reviews across all movies
        List<Movie> movies = movieRepository.findAll();
        List<AdminReviewView> out = new ArrayList<>();

        for (Movie m : movies) {
            if (m.getReviewIds() == null) continue;
            for (Review r : m.getReviewIds()) {
                out.add(toView(r, m.getImdbId()));
            }
        }

        out.sort(Comparator.comparing(AdminReviewView::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed());
        return out;
    }

    // - delete some review
    @Transactional
    public void delete(String reviewId) {
        final ObjectId oid;
        try {
            oid = new ObjectId(reviewId);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid review id");
        }

        Review review = reviewRepository.findById(oid)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        int rating = review.getRating() == null ? 0 : review.getRating();

        // update the movie that contains this reviewId: pull + decrement stats
        mongoTemplate.update(Movie.class)
                .matching(Criteria.where("reviewIds").is(oid))
                .apply(new Update()
                        .pull("reviewIds", oid)
                        .inc("ratingCount", -1)
                        .inc("ratingSum", -rating)
                )
                .first();

        reviewRepository.deleteById(oid);
    }

    // init AdminReviewView
    private AdminReviewView toView(Review r, String imdbId) {
        AdminReviewView v = new AdminReviewView();
        v.setId(r.getId() == null ? null : r.getId().toHexString());
        v.setImdbId(imdbId);
        v.setUserId(r.getUserId());
        v.setUsername(r.getUsername());
        v.setBody(r.getBody());
        v.setCreatedAt(r.getCreatedAt() == null ? null : r.getCreatedAt().toString());
        return v;
    }
}