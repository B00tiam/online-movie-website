import {useEffect, useRef} from "react";
import api from "../../api/AxiosConfig";
import {useParams, Link} from "react-router-dom";
import {Container, Row, Col, Alert} from "react-bootstrap";
import ReviewForm from "../reviewForm/ReviewForm";
import {useAuth} from "../../context/AuthContext";


const Reviews = ({getMovieData, movie, reviews, setReviews}) => {
  const revText = useRef();
  let params = useParams();
  const movieId = params.movieId;
  const {isAuthenticated, user} = useAuth();

  useEffect(() => {
    getMovieData(movieId);
  },[]);

  const addReview = async (e) => {
    e.preventDefault();
    const rev = revText.current;

    try {
      const response = await api.post(`/api/reviews`, {reviewBody: rev.value, imdbId: movieId});
      const updatedReviews = [...reviews, {body: rev.value, username: user?.username}];
      rev.value = "";
      setReviews(updatedReviews);
    }
    catch (err) {
      console.error(err);
      alert("Something went wrong! Please try logging again later.");
    }
  };

  return (
    <Container>
      <Row>
        <Col><h3>Reviews</h3></Col>
      </Row>
      <Row className="mt-2">
        <Col>
          <img src={movie?.poster} alt=""/>
        </Col>
        <Col>
          {isAuthenticated ? (
            <>
              <Row>
                <Col>
                  <ReviewForm handleSubmit={addReview} revText={revText} labelText="Leave a Review?"/>
                </Col>
              </Row>
              <Row>
                <Col>
                  <hr/>
                </Col>
              </Row>
            </>
          ) : (
            <Alert variant="info">
              Please <Link to="/login">login</Link> and leave a review!
            </Alert>
          )}
          {
            reviews?.map((r, index) => {
              return (
                <div key={index}>
                  <Row>
                    <Col>
                      {r.username && <strong className="text-info">{r.username}: </strong>}
                      {r.body}
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <hr/>
                    </Col>
                  </Row>
                </div>
              )
            })
          }
        </Col>
      </Row>
      <Row>
        <Col>
          <hr/>
        </Col>
      </Row>
    </Container>
  )
};

export default Reviews;
