import React, { useState, useEffect } from "react";
import { Container, Card, Badge, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import api from "../../api/AxiosConfig";


const UserProfile = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();

  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null); // { type: "success"|"danger", text: string }

  // load profile (birthday & gender) from backend on mount
  useEffect(() => {
    if (!isAuthenticated) return;
    api.get("/api/auth/profile")
      .then(res => {
        setBirthday(res.data.birthday || "");
        setGender(res.data.gender || "");
      })
      .catch(() => {});
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user?.role === "ADMIN";

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const res = await updateProfile({ birthday: birthday || null, gender: gender || null });
    setSaving(false);
    if (res.success) {
      setMsg({ type: "success", text: "Profile updated successfully!" });
    } else {
      setMsg({ type: "danger", text: res.message || "Update failed." });
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: "600px" }}>
      <Card bg="dark" text="white" className="shadow">
        <Card.Header
          className="text-center py-4"
          style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)" }}
        >
          {/* pic placeholder */}
          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              background: "gold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: "#1a1a2e",
              margin: "0 auto 12px",
            }}
          >
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <Card.Title style={{ color: "gold", fontSize: "1.5rem" }}>
            {user?.username}
          </Card.Title>
          <Badge bg={isAdmin ? "danger" : "secondary"} text="dark">
            {isAdmin ? "Admin" : "User"}
          </Badge>
        </Card.Header>

        <Card.Body className="px-4 py-4">
          {/* Read-only fields */}
          <Row className="mb-3 align-items-center">
            <Col xs={4} style={{ color: "#adb5bd" }} className="fw-semibold">
              Username
            </Col>
            <Col xs={8} className="text-white">
              {user?.username || "—"}
            </Col>
          </Row>

          <hr style={{ borderColor: "#444" }} />

          <Row className="mb-3 align-items-center">
            <Col xs={4} style={{ color: "#adb5bd" }} className="fw-semibold">
              Email
            </Col>
            <Col xs={8} className="text-white">
              {user?.email || "—"}
            </Col>
          </Row>

          <hr style={{ borderColor: "#444" }} />

          <Row className="mb-3 align-items-center">
            <Col xs={4} style={{ color: "#adb5bd" }} className="fw-semibold">
              Role
            </Col>
            <Col xs={8}>
              <Badge bg={isAdmin ? "danger" : "secondary"} text="dark">
                {user?.role || "USER"}
              </Badge>
            </Col>
          </Row>

          <hr style={{ borderColor: "#444" }} />

          {/* Editable fields */}
          <Form onSubmit={handleUpdate}>
            <Row className="mb-3 align-items-center">
              <Col xs={4} style={{ color: "#adb5bd" }} className="fw-semibold">
                Birthday
              </Col>
              <Col xs={8}>
                <Form.Control
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  style={{
                    background: "#2c2c3e",
                    color: "white",
                    border: "1px solid #555",
                  }}
                />
              </Col>
            </Row>

            <hr style={{ borderColor: "#444" }} />

            <Row className="mb-4 align-items-center">
              <Col xs={4} style={{ color: "#adb5bd" }} className="fw-semibold">
                Gender
              </Col>
              <Col xs={8}>
                <Form.Select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={{
                    background: "#2c2c3e",
                    color: "white",
                    border: "1px solid #555",
                  }}
                >
                  <option value="">-- Not specified --</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Col>
            </Row>

            {msg && (
              <Alert variant={msg.type} className="py-2 text-center">
                {msg.text}
              </Alert>
            )}

            <div className="d-flex justify-content-end">
              <Button
                type="submit"
                variant="warning"
                disabled={saving}
                style={{ color: "#1a1a2e", fontWeight: "bold", minWidth: "100px" }}
              >
                {saving ? "Saving..." : "Update"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserProfile;