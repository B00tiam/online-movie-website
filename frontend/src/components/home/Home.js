import React, {useMemo} from "react";

import Hero from "../hero/Hero";
import Library from "../library/Library";


const getRandomMovies = (movies, count) => {
  // if there are no movies:
  if (!movies || movies.length === 0) return [];

  // copy the movies array
  const copy = [...movies];
  // randomly sort the movies
  copy.sort(() => Math.random() - 0.5);
  return copy.slice(0, Math.min(count, copy.length));
};

const Home = ({movies}) => {
  // randomly select 5 movies from the movies array to show in the hero section
  const randomMoviesForHero = useMemo(
    () => getRandomMovies(movies, 5),   // just use 5
    [movies]
  );

  return (
    <div>
      {/*just show some random movies*/}
      <Hero movies={randomMoviesForHero}/>

      {/*show all movies*/}
      <Library movies={movies}/>
    </div>
  );
};

export default Home;
