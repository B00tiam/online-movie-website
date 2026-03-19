package movie.project.backend.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import movie.project.backend.domain.Review;
import movie.project.backend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    public static class CreateReviewRequest {

        @NotBlank
        private String reviewBody;

        @NotBlank
        private String imdbId;

        @NotNull
        @Min(1)
        @Max(5)
        private Integer rating;

        public String getReviewBody() {
            return reviewBody;
        }

        public void setReviewBody(String reviewBody) {
            this.reviewBody = reviewBody;
        }

        public String getImdbId() {
            return imdbId;
        }

        public void setImdbId(String imdbId) {
            this.imdbId = imdbId;
        }

        public Integer getRating() {
            return rating;
        }

        public void setRating(Integer rating) {
            this.rating = rating;
        }
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Review> createReview(@Valid @RequestBody CreateReviewRequest payload) {
        Review review = reviewService.createReview(
                payload.getReviewBody(),
                payload.getRating(),
                payload.getImdbId()
        );
        return new ResponseEntity<>(review, HttpStatus.CREATED);
    }

}