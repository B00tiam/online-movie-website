import './App.css';
import api from './api/AxiosConfig';
import {useState, useEffect} from "react";
import Layout from "./components/Layout";
import {Routes, Route} from "react-router-dom";
import {AuthProvider} from "./context/AuthContext";

import Home from "./components/home/Home";
import Header from "./components/header/Header";
import Trailer from "./components/trailer/Trailer";
import Reviews from "./components/reviews/Reviews";
import NotFound from "./components/notFound/NotFound";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

function App() {

  const [movies, setMovies] = useState();
  const [movie, setMovie] = useState();
  const [reviews, setReviews] = useState();

  const getMovies = async () => {

    try {
      // get the url
      const response = await api.get("/api/movies");

      // console.log(response.data);

      setMovies(response.data);
    }
    catch (err) {
      console.log(err);
    }
  };

  const getMovieData = async (movieId) => {
    try {
      const response = await api.get(`/api/movies/${movieId}`);
      const singleMovie = response.data;
      setMovie(singleMovie);
      setReviews(singleMovie.reviewIds || []);    // avoid the situation that reviews is undefined/null

    }
    catch (err) {
      console.error(err);
      setReviews([]);
    }
  };

  useEffect(() => {
    getMovies();
  },[]);

  return (
    <AuthProvider>
      <div className="App">
        <Header/>
        <Routes>
          <Route path="/" element={<Layout/>}>
            <Route path="/" element={<Home movies={movies}/>}></Route>
            <Route path="/Trailer/:ytTrailerId" element={<Trailer/>}></Route>
            <Route path="/Reviews/:movieId" element={<Reviews getMovieData={getMovieData} movie={movie} reviews={reviews} setReviews={setReviews}/>}></Route>
            <Route path="/login" element={<Login/>}></Route>
            <Route path="/register" element={<Register/>}></Route>
            <Route path="*" element={<NotFound/>}></Route>
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );

}

export default App;
