import "./Watchlist.css";

import React, {useEffect, useState} from "react";
import api from "../../api/AxiosConfig";
import {useAuth} from "../../context/AuthContext";
import {useNavigate, Link} from "react-router-dom";
import {Button, Row, Col} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHeart} from "@fortawesome/free-solid-svg-icons";


const Watchlist = () => {
  const { isAuthenticated, toggleWatchlist, refreshWatchlist } = useAuth();
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }
      const res = await api.get("/api/watchlist");
      setMovies(res.data || []);
      await refreshWatchlist();
    };
    load();
  }, [isAuthenticated, navigate, refreshWatchlist]);

  const remove = async (imdbId) => {
    await toggleWatchlist(imdbId);
    setMovies(prev => prev.filter(m => m.imdbId !== imdbId));
  };

  return (
    <div className="container mt-4">
      <Row className="align-items-center mb-3">
        <Col>
          <h2 className="mb-0">My Watchlist</h2>
        </Col>

        <Col xs="auto">
          <Button as={Link} variant="outline-secondary" to="/">
            Back to Home
          </Button>
        </Col>
      </Row>

      {movies.length === 0 ? (
        <p className="text-muted">Your watchlist is empty.</p>
      ) : (
        <div className="row g-3">
          {movies.map(m => (
            <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={m.imdbId}>
              <div className="text-center">
                <div style={{ position: "relative" }}>
                  <img src={m.poster} alt={m.title} className="img-fluid rounded" />
                  <button
                    type="button"
                    onClick={() => remove(m.imdbId)}
                    title="Remove"
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
                    <FontAwesomeIcon icon={faHeart} style={{ color: "#ff2d55" }} />
                  </button>
                </div>

                <h6 className="mt-2">{m.title}</h6>

                <div className="library-buttons-container">
                  {/*watch button*/}
                  <Link
                    to={`/Trailer/${m.trailerLink.split("v=")[1]}`}
                    className="btn btn-warning btn-sm library-button"
                  >
                    Watch
                  </Link>

                  {/*review button*/}
                  <Button
                    as={Link}
                    to={`/Reviews/${m.imdbId}`}
                    variant="primary"
                    size="sm"
                    className="library-button"
                  >
                    Reviews
                  </Button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;