import React from "react";
import { Container, Card, Badge, Row, Col } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";



const UserProfile = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user?.role === "ADMIN";

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

          <Row className="mb-3 align-items-center">
            <Col xs={4} style={{ color: "#adb5bd" }} className="fw-semibold">
              Birthdate
            </Col>
            <Col xs={8} className="text-white">
              {"—"}
            </Col>
          </Row>

          <Row className="mb-3 align-items-center">
            <Col xs={4} style={{ color: "#adb5bd" }} className="fw-semibold">
              Gender
            </Col>
            <Col xs={8} className="text-white">
              {"—"}
            </Col>
          </Row>

        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserProfile;