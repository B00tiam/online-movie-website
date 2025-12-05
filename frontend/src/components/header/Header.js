import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faVideoSlash} from "@fortawesome/free-solid-svg-icons";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import {NavLink, useNavigate} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";


const Header = () => {
  const {user, isAuthenticated, logout} = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
          </Nav>
          {isAuthenticated ? (
            <>
              <span className="text-light me-3">Welcome, {user?.username}</span>
              <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button variant="outline-info" className="me-2" onClick={() => navigate('/login')}>Login</Button>
              <Button variant="outline-info" onClick={() => navigate('/register')}>Register</Button>
            </>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
};

export default Header;