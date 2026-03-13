import React, {useEffect, useState} from "react";
import {Alert, Button, Container, Form, Spinner, Table} from "react-bootstrap";
import api from "../../api/AxiosConfig";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const load = async () => {
    setLoading(true);
    setErrMsg("");
    try {
      const res = await api.get("/api/admin/users");
      setUsers(res.data ?? []);
    } catch (e) {
      setErrMsg("Loading failed: please make sure you are logged in with admin account");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setEnabled = async (id, enabled) => {
    const res = await api.patch(`/api/admin/users/${id}/enabled`, {enabled});
    const updated = res.data;
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
  };

  const setRole = async (id, role) => {
    const res = await api.patch(`/api/admin/users/${id}/role`, {role});
    const updated = res.data;
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Admin - Users</h2>
        <Button variant="outline-secondary" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

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
              <th style={{width: "28%"}}>ID</th>
              <th style={{width: "22%"}}>Username</th>
              <th style={{width: "18%"}}>Role</th>
              <th style={{width: "18%"}}>Enabled</th>
              <th style={{width: "14%"}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{wordBreak: "break-all"}}>{u.id}</td>
                <td>{u.username ?? "-"}</td>
                <td>
                  <Form.Select
                    value={u.role ?? "USER"}
                    onChange={(e) => setRole(u.id, e.target.value)}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </Form.Select>
                </td>
                <td>
                  <Form.Check
                    type="switch"
                    checked={!!u.enabled}
                    onChange={(e) => setEnabled(u.id, e.target.checked)}
                    label={u.enabled ? "ON" : "OFF"}
                  />
                </td>
                <td>
                  {/* not implement delete user yet */}
                  <Button size="sm" variant="outline-danger" disabled>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}