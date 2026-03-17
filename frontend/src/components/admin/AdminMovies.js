import React, {useEffect, useState} from "react";
import {Alert, Button, Container, Form, Spinner, Table} from "react-bootstrap";
import api from "../../api/AxiosConfig";

export default function AdminMovies() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [tmdbId, setTmdbId] = useState("");

  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const load = async (nextQ) => {
    setLoading(true);
    setErrMsg("");
    try {
      const value = (nextQ ?? q).trim();
      const res = await api.get("/api/admin/movies", {params: value ? {q: value} : {}});
      setItems(res.data ?? []);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) setErrMsg("Unauthorized: admin login required");
      else setErrMsg("Loading failed, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load("");
  }, []);

  const onImport = async (e) => {
    e.preventDefault();
    setErrMsg("");

    const value = tmdbId.trim();
    if (!value) return;

    try {
      const res = await api.post(`/api/admin/movies/import/tmdb/${encodeURIComponent(value)}`);
      const created = res.data;
      setItems((prev) => [created, ...prev.filter(m => m.imdbId !== created?.imdbId)]);
      setTmdbId("");
    } catch (e2) {
      const status = e2?.response?.status;
      const msg = e2?.response?.data?.message;

      if (status === 404) setErrMsg(`TMDB movie not found: tmdbId=${value}`);
      else if (status === 409) setErrMsg(msg || "Movie already exists");
      else if (status === 400) setErrMsg(msg || "Import failed: invalid tmdbId or missing imdbId");
      else if (status === 401 || status === 403) setErrMsg("Unauthorized: admin login required");
      else setErrMsg("Import failed, please try again later.");
    }
  };

  const onDelete = async (imdbId) => {
    const ok = window.confirm(`Delete movie ${imdbId}? This may also delete its reviews.`);
    if (!ok) return;

    try {
      await api.delete(`/api/admin/movies/${encodeURIComponent(imdbId)}`);
      setItems((prev) => prev.filter((m) => m.imdbId !== imdbId));
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) alert("Unauthorized: admin login required");
      else alert("Delete failed");
    }
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Admin - Movies</h2>
        <Button variant="outline-secondary" onClick={() => load()} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Form className="d-flex gap-2 mb-3" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <Form.Control value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title (optional)" />
        <Button type="submit" variant="primary" disabled={loading}>Search</Button>
        <Button type="button" variant="outline-secondary" disabled={loading} onClick={() => { setQ(""); load(""); }}>
          Clear
        </Button>
      </Form>

      <Form className="d-flex gap-2 mb-3" onSubmit={onImport}>
        <Form.Control
          value={tmdbId}
          onChange={(e) => setTmdbId(e.target.value)}
          placeholder="TMDB Movie ID (e.g. 315162)"
        />
        <Button type="submit" variant="success">
          Import from TMDB
        </Button>
      </Form>

      {loading && (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" />
        </div>
      )}

      {!loading && errMsg && <Alert variant="danger">{errMsg}</Alert>}

      {!loading && !errMsg && (
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th style={{width: "16%"}}>imdbId</th>
              <th>Title</th>
              <th style={{width: "12%"}}>Release</th>
              <th style={{width: "22%"}}>Genres</th>
              <th style={{width: "10%"}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.imdbId}>
                <td style={{wordBreak: "break-all"}}>{m.imdbId}</td>
                <td>{m.title}</td>
                <td>{m.releaseDate ?? "-"}</td>
                <td>{Array.isArray(m.genres) ? m.genres.join(", ") : "-"}</td>
                <td>
                  <Button size="sm" variant="outline-danger" onClick={() => onDelete(m.imdbId)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted">No movies</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
}