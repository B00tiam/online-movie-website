package movie.project.backend.service;


import movie.project.backend.domain.Movie;
import movie.project.backend.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Collections;


@Service
public class MovieService {

    @Autowired
    private MovieRepository movieRepository;

    public List<Movie> allMovies() {
        return movieRepository.findAll();
    }

    public Optional<Movie> singleMovie(String imdbId) {
        return movieRepository.findMovieByImdbId(imdbId);
    }

    // sort movies by release date & genre
    public List<Movie> moviesByGenreLatestFirst(String genre) {
        return movieRepository.findByGenresContainingOrderByReleaseDateDesc(genre);
    }

    // get movies by title, and sort by release date
    public List<Movie> moviesByTitleLatestFirst(String title) {
        return movieRepository.findByTitleContainingIgnoreCaseOrderByReleaseDateDesc(title);
    }

    public List<Movie> searchMovies(String q) {
        // if query is null or empty, return all movies
        if (q == null) {
            return movieRepository.findAll();
        }
        String keyword = q.trim();
        if (keyword.isEmpty()) {
            return movieRepository.findAll();
        }
        // search by title
        return movieRepository.findByTitleContainingIgnoreCaseOrderByReleaseDateDesc(keyword);
    }
}
