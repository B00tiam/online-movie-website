import './Library.css';

import React from "react";
import {Link, useNavigate} from "react-router-dom";
import Button from "react-bootstrap/Button";


const Library = ({movies}) => {
  const navigate = useNavigate();

  const handleReviews = (movieId) => {
    navigate(`/Reviews/${movieId}`);
  };

  return (
    <div className="all-movies-container">
      <h2>All Movies</h2>
      {/*use Bootstrap to arrange the posters*/}
      <div className="row g-4">
        {movies?.map((movie) => (
          <div
            key={movie.imdbId}
            className="col-6 col-sm-4 col-md-3 col-lg-2"
          >
            <div className="all-movie-card text-center">
              <img
                src={movie.poster}
                alt={movie.title}
                className="img-fluid rounded"
              />
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
        ))}
      </div>
    </div>
  );
};

export default Library;