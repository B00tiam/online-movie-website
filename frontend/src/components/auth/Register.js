import {useState} from 'react';
import {Container, Form, Button, Alert, Card} from 'react-bootstrap';
import {useNavigate, Link} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('The passwords are inconsistent!');
      return;
    }

    setLoading(true);
    const result = await register(username, email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '400px' }}>
      <Card className="bg-dark text-light">
        <Card.Body>
          <h2 className="text-center mb-4">Register</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={20}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>E-mail</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                minLength={6}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="info" type="submit" className="w-100" disabled={loading}>
              {loading ? 'Registering...' : 'Registered'}
            </Button>
          </Form>
          <div className="text-center mt-3">
            Already have account? <Link to="/login" style={{ color: 'gold' }}>Login now!</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;