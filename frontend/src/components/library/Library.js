import './Library.css';

import React from "react";
import {Link, useNavigate} from "react-router-dom";
import Button from "react-bootstrap/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHeart} from "@fortawesome/free-solid-svg-icons";
import {useAuth} from "../../context/AuthContext";


const Library = ({movies}) => {
  const navigate = useNavigate();
  const {isAuthenticated, watchlistIds, toggleWatchlist} = useAuth();

  const handleReviews = (movieId) => {
    navigate(`/Reviews/${movieId}`);
  };

  const handleToggle = async (imdbId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await toggleWatchlist(imdbId);
  };

  return (
    <div className="all-movies-container">
      <h2>All Movies</h2>
      {/*use Bootstrap to arrange the posters*/}
      <div className="row g-4">
        {movies?.map((movie) => {
          const inWatchlist = watchlistIds?.includes(movie.imdbId);

          return (
            <div
              key={movie.imdbId}
              className="col-6 col-sm-4 col-md-3 col-lg-2"
            >
              <div className="all-movie-card text-center">
                <div style={{ position: "relative" }}>
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="img-fluid rounded"
                  />

                  <button
                    type="button"
                    onClick={() => handleToggle(movie.imdbId)}
                    aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                    title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                    style={{
                      position: "absolute",
                      right: "8px",
                      bottom: "8px",
                      width: "34px",
                      height: "34px",
                      borderRadius: "999px",
                      border: "none",
                      background: "rgba(0,0,0,0.55)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer"
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faHeart}
                      style={{ color: inWatchlist ? "#ff2d55" : "#ffffff" }}
                    />
                  </button>
                </div>

                <h6 className="mt-2">{movie.title}</h6>

                {/*2 buttons: watch & review*/}
                <div className="library-buttons-container">
                  {/*watch button*/}
                  <Link
                    to={`/Trailer/${movie.trailerLink.split("v=")[1]}`}
                    className="btn btn-warning btn-sm library-button"
                  >
                    Watch
                  </Link>
                  {/*review button*/}
                  <Button
                    variant="info"
                    size="sm"
                    className="library-button"
                    onClick={() => handleReviews(movie.imdbId)}
                  >
                    Reviews
                  </Button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Library;