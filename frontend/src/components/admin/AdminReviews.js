import React, {useEffect, useState} from "react";
import {Alert, Button, Container, Form, Spinner, Table} from "react-bootstrap";
import api from "../../api/AxiosConfig";

export default function AdminReviews() {
  const [items, setItems] = useState([]);
  const [imdbId, setImdbId] = useState("");
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const load = async (nextImdbId) => {
    setLoading(true);
    setErrMsg("");
    try {
      const value = (nextImdbId ?? imdbId).trim();
      const res = await api.get("/api/admin/reviews", {
        params: value ? {imdbId: value} : {}
      });
      setItems(res.data ?? []);
    } catch (e) {
      const status = e?.response?.status;
      const value = (nextImdbId ?? imdbId).trim();

      if (status === 401 || status === 403) {
        setErrMsg("Unauthorized: please make sure you are logged in with admin account");
      } else if (status === 404) {
        setErrMsg(`Movie not found: imdbId=${value || "(empty)"}`);
        setItems([]);
      } else if (status === 400) {
        setErrMsg(`Invalid request: imdbId=${value || "(empty)"}`);
      } else {
        setErrMsg("Loading failed, please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load("");
  }, []);

  const onDelete = async (id) => {
    const ok = window.confirm("Delete this review permanently?");
    if (!ok) return;

    try {
      await api.delete(`/api/admin/reviews/${id}`);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        alert("Unauthorized: admin login required");
      } else {
        alert("Delete failed. Please try again later.");
      }
    }
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Admin - Reviews</h2>
        <Button variant="outline-secondary" onClick={() => load()} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Form
        className="d-flex gap-2 mb-3"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <Form.Control
          value={imdbId}
          onChange={(e) => setImdbId(e.target.value)}
          placeholder="Filter by imdbId (optional)"
        />
        <Button type="submit" variant="primary" disabled={loading}>
          Apply
        </Button>
        <Button
          type="button"
          variant="outline-secondary"
          disabled={loading}
          onClick={() => {
            setImdbId("");
            load("");
          }}
        >
          Clear
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
              <th style={{width: "18%"}}>ID</th>
              <th style={{width: "12%"}}>imdbId</th>
              <th style={{width: "12%"}}>User</th>
              <th>Body</th>
              <th style={{width: "14%"}}>CreatedAt</th>
              <th style={{width: "10%"}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td style={{wordBreak: "break-all"}}>{r.id}</td>
                <td style={{wordBreak: "break-all"}}>{r.imdbId ?? "-"}</td>
                <td>{r.username ?? r.userId ?? "-"}</td>
                <td style={{maxWidth: 520}}>{r.body ?? "-"}</td>
                <td>{r.createdAt ?? "-"}</td>
                <td>
                  <Button size="sm" variant="outline-danger" onClick={() => onDelete(r.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-muted">
                  No reviews
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
}