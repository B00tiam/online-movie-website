import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faVideoSlash} from "@fortawesome/free-solid-svg-icons";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import {NavLink, useNavigate} from "react-router-dom";
import {Link} from "react-router-dom";
import React, {useState} from "react";
import {Form} from "react-bootstrap";

import {useAuth} from "../../context/AuthContext";


const Header = () => {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const {user, isAuthenticated, logout, deleteAccount} = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    const ok = window.confirm("Permanently delete your account? This action cannot be undone.");
    if (!ok) return;

    const res = await deleteAccount?.();
    if (res?.success !== false) {
      navigate('/');
      return;
    }
    alert(res?.message || "delete account failed!");
  };

  const genres = ["Action", "Adventure", "Comedy", "Fantasy", "Science Fiction", "Horror", "Animation", "Family", "Drama"];

  const submit = (e) => {
    e.preventDefault();
    const keyword = q.trim();
    navigate(keyword ? `/search?q=${encodeURIComponent(keyword)}` : "/search");
  };

  const isAdmin = isAuthenticated && user?.role === "ADMIN";

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container fluid>
        <Navbar.Brand href="/" style={{color: "gold"}}>
          <FontAwesomeIcon icon={faVideoSlash}/>Gold
        </Navbar.Brand>
        <Navbar.Collapse id="navbarScroll">
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{maxHeight: '100px'}}
            navbarScroll
          >
            <NavLink className="nav-link" to="/">Home</NavLink>
            <NavLink className="nav-link" to="/watchList">Watchlist</NavLink>

            <NavDropdown title="Genres" id="genres-dropdown" menuVariant="dark">
              {genres.map((g) => (
                <NavDropdown.Item
                  key={g}
                  as={Link}
                  to={`/genre/${encodeURIComponent(g)}`}
                >
                  {g}
                </NavDropdown.Item>
              ))}
            </NavDropdown>

            {isAdmin && (
              <>
                <NavLink className="nav-link" to="/admin/users">Users</NavLink>
                <NavLink className="nav-link" to="/admin/reviews">Reviews</NavLink>
                <NavLink className="nav-link" to="/admin/movies">Movies</NavLink>
              </>
            )}
          </Nav>

          <Form onSubmit={submit} className="d-flex ms-auto gap-2">
            <Form.Control
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Searching..."
            />
            <Button type="submit" variant="outline-light">
              Search
            </Button>
          </Form>

          <Nav className="ms-auto">
            <NavDropdown
              align="end"
              title={isAuthenticated ? `Welcome, ${user?.username || ""}` : "Account"}
              id="account-dropdown"
              menuVariant="dark"
            >
              {isAuthenticated ? (
                <>
                  <NavDropdown.Item onClick={handleLogout}>
                    Logout
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item className="text-danger" onClick={handleDeleteAccount}>
                    Delete Account
                  </NavDropdown.Item>
                </>
              ) : (
                <>
                  <NavDropdown.Item onClick={() => navigate('/login')}>
                    Login
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => navigate('/register')}>
                    Register
                  </NavDropdown.Item>
                </>
              )}
            </NavDropdown>
          </Nav>

        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
};

export default Header;