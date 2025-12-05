import {useState} from 'react';
import {Container, Form, Button, Alert, Card} from 'react-bootstrap';
import {useNavigate, Link} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(usernameOrEmail, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <Container className="mt-5" style={{maxWidth:'400px'}}>
      <Card className="bg-dark text-light">
        <Card.Body>
          <h2 className="text-center mb-4">Login</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username or Email</Form.Label>
              <Form.Control
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="info" type="submit" className="w-100" disabled={loading}>
              {loading ? 'Logging...' : 'Login'}
            </Button>
          </Form>
          <div className="text-center mt-3">
            Don't have account yet? <Link to="/register" style={{ color: 'gold' }}>Register now!</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;