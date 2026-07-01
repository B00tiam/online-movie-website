import {useEffect, useState} from "react";
import {useParams, Link} from "react-router-dom";
import {Spinner, Alert} from "react-bootstrap";
import api from "../../api/AxiosConfig";
import "./Trailer.css";


const Trailer = () => {
  const {ytTrailerId} = useParams();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMovieByTrailer = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/movies");
        const allMovies = res.data ?? [];
        const found = allMovies.find(
          (m) => m.trailerLink && m.trailerLink.includes(ytTrailerId)
        );
        if (found) {
          setMovie(found);
          setReviews(found.reviewIds ?? []);
        }
      } catch (e) {
        setError("Cannot load movie information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (ytTrailerId) fetchMovieByTrailer();
  }, [ytTrailerId]);

  return (
    <div className="trailer-page">

      {/* player */}
      <div className="react-player-container">
        {ytTrailerId ? (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${ytTrailerId}?autoplay=0&controls=1`}
            title="Movie Trailer"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="trailer-unavailable">
            This video is now unavailable!
          </div>
        )}
      </div>

      {/* title */}
      {movie && (
        <h4 className="trailer-movie-title">{movie.title}</h4>
      )}

      <hr className="trailer-divider"/>

      {/* reviews */}
      <div className="trailer-reviews-section">
        <h5>Reviews</h5>

        {loading && <Spinner animation="border" size="sm"/>}

        {!loading && error && <Alert variant="danger">{error}</Alert>}

        {!loading && !error && reviews.length === 0 && (
          <p className="text-muted">No reviews now...</p>
        )}

        {!loading && !error && reviews.map((r, index) => (
          <div key={index} className="trailer-review-item">
            {r.username && (
              <span className="trailer-review-username">{r.username}: </span>
            )}
            {typeof r.rating === "number" && (
              <span className="trailer-review-rating">({r.rating}/5) </span>
            )}
            <span>{r.body}</span>
            <hr className="trailer-divider"/>
          </div>
        ))}

        {/* jump to review page */}
        {!loading && movie && (
          <div className="trailer-review-link">
            <Link to={`/Reviews/${movie.imdbId}`} className="btn btn-primary">
              Check all reviews &amp; Write a review!
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};

export default Trailer;