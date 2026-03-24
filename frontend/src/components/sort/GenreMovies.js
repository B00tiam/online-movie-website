import {useEffect, useState} from "react";
import {useParams, Link, useNavigate} from "react-router-dom";
import {Container, Row, Col, Card, Spinner, Alert, Button} from "react-bootstrap";

import api from "../../api/AxiosConfig";
import {useAuth} from "../../context/AuthContext";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHeart} from "@fortawesome/free-solid-svg-icons";

const GenreMovies = () => {
  const { genre } = useParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // desc: newest->oldest, asc: oldest->newest

  const navigate = useNavigate();
  const {isAuthenticated, watchlistIds, toggleWatchlist} = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErrMsg("");
      try {
        const encoded = encodeURIComponent(genre);
        const res = await api.get(`/api/movies/genre/${encoded}`);
        if (!cancelled) setMovies(res.data ?? []);
      } catch (e) {
        if (!cancelled) setErrMsg("Loading failed, please try again later.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [genre]);

  const sortedMovies = [...movies].sort((a, b) => {
    const da = a?.releaseDate || "";
    const db = b?.releaseDate || "";
    return sortOrder === "desc" ? db.localeCompare(da) : da.localeCompare(db);
  });

  const handleToggle = async (imdbId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    await toggleWatchlist(imdbId);
  };

  const getAvgRating = (movie) => {
    if (typeof movie?.avgRating === "number") return movie.avgRating;

    const sum = Number(movie?.ratingSum ?? 0);
    const count = Number(movie?.ratingCount ?? 0);
    if (!Number.isFinite(sum) || !Number.isFinite(count) || count <= 0) return null;

    return sum / count;
  };

  return (
    <Container className="mt-4">
      <Row className="align-items-center mb-3">
        <Col>
          <h2 className="mb-0">Genre: {genre}</h2>
          <div className="text-muted">
            Release date: {sortOrder === "desc" ? "newest to oldest" : "oldest to newest"}
          </div>
        </Col>

        <Col xs="auto" className="d-flex gap-2 align-items-center">
          <select
            className="form-select form-select-sm"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{ width: 200 }}
          >
            <option value="desc">Newest → Oldest</option>
            <option value="asc">Oldest → Newest</option>
          </select>

          <Button as={Link} variant="outline-secondary" to="/">
            Back to Home
          </Button>
        </Col>
      </Row>

      {loading && (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" />
        </div>
      )}

      {!loading && errMsg && <Alert variant="danger">{errMsg}</Alert>}

      {!loading && !errMsg && movies.length === 0 && (
        <Alert variant="info">No movies are currently available</Alert>
      )}

      <Row xs={2} md={4} lg={5} className="g-3">
        {sortedMovies.map((m) => {
          const inWatchlist = watchlistIds?.includes(m.imdbId);
          const avg = getAvgRating(m);

          return (
            <Col key={m.imdbId}>
              <Card className="h-100">
                <div style={{ position: "relative" }}>
                  {m.poster && <Card.Img variant="top" src={m.poster} alt={m.title} />}

                  {avg !== null && (
                    <div
                      style={{
                        position: "absolute",
                        left: "8px",
                        bottom: "8px",
                        padding: "4px 8px",
                        borderRadius: "10px",
                        background: "rgba(0,0,0,0.65)",
                        color: "#fff",
                        fontSize: "22px",
                        fontWeight: 600,
                        lineHeight: 1
                      }}
                      title={`Average rating: ${avg.toFixed(1)} / 5 (${m?.ratingCount ?? 0})`}
                    >
                      {avg.toFixed(1)} / 5
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleToggle(m.imdbId)}
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

                <Card.Body>
                  <Card.Title style={{ fontSize: "1rem" }}>{m.title}</Card.Title>
                  <Card.Text className="text-muted" style={{ fontSize: "0.9rem" }}>
                    {m.releaseDate}
                  </Card.Text>

                  <div className="d-flex gap-2 flex-wrap">
                    <Link
                      to={`/Trailer/${m.trailerLink?.split("v=")[1]}`}
                      className="btn btn-warning btn-sm"
                    >
                      Watch
                    </Link>

                    <Button
                      as={Link}
                      to={`/Reviews/${m.imdbId}`}
                      variant="primary"
                      size="sm"
                    >
                      Reviews
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default GenreMovies;