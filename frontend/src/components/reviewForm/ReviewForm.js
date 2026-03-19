import {Form} from 'react-bootstrap';
import Button from "react-bootstrap/Button";

const ReviewForm = ({handleSubmit, revText, ratingRef, labelText, defaultValue}) => {
  return (
    <Form>
      <Form.Group className="mb-3" controlId="reviewRating">
        <Form.Label>Rating (required)</Form.Label>
        <Form.Select ref={ratingRef} defaultValue="5" required>
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Good</option>
          <option value="3">3 - Ok</option>
          <option value="2">2 - Bad</option>
          <option value="1">1 - Terrible</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
        <Form.Label>{labelText}</Form.Label>
        <Form.Control ref={revText} as="textarea" rows={3} defaultValue={defaultValue}/>
      </Form.Group>

      <Button variant="outline-info" onClick={handleSubmit}>Submit</Button>
    </Form>
  )
};

export default ReviewForm;