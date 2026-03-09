package movie.project.backend.service;

import movie.project.backend.domain.Movie;
import movie.project.backend.domain.User;
import movie.project.backend.domain.Watchlist;
import movie.project.backend.repository.MovieRepository;
import movie.project.backend.repository.WatchlistRepository;
import movie.project.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;

    public WatchlistService(WatchlistRepository watchlistRepository,
                            MovieRepository movieRepository,
                            UserRepository userRepository) {
        this.watchlistRepository = watchlistRepository;
        this.movieRepository = movieRepository;
        this.userRepository = userRepository;
    }

    public List<Movie> getMyWatchlistMovies() {
        String userId = requireCurrentUserId();
        List<Watchlist> entries = watchlistRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return entries.stream()
                .map(e -> movieRepository.findMovieByImdbId(e.getImdbId()).orElse(null))
                .filter(m -> m != null)
                .toList();
    }

    public boolean addToMyWatchlist(String imdbId) {
        String userId = requireCurrentUserId();

        if (watchlistRepository.existsByUserIdAndImdbId(userId, imdbId)) {
            return true;
        }

        // optional: you can also check if the movie imdbId exists here
        watchlistRepository.save(new Watchlist(null, userId, imdbId, null));
        return true;
    }

    public boolean removeFromMyWatchlist(String imdbId) {
        String userId = requireCurrentUserId();
        watchlistRepository.deleteByUserIdAndImdbId(userId, imdbId);
        return false;
    }

    public boolean isInMyWatchlist(String imdbId) {
        String userId = requireCurrentUserId();
        return watchlistRepository.existsByUserIdAndImdbId(userId, imdbId);
    }

    private String requireCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new IllegalStateException("Unauthenticated");
        }

        Object principal = auth.getPrincipal();

        // situation A: UserDetailsService returns the domain.User (implements UserDetails)
        if (principal instanceof User u) {
            return u.getId();
        }

        // situation B: principal is UserDetails, but not domain.User (e.g., Spring Security's built-in User)
        if (principal instanceof UserDetails ud) {
            String username = ud.getUsername();
            return userRepository.findByUsername(username)
                    .map(User::getId)
                    .orElseThrow(() -> new IllegalStateException("User not found by username: " + username));
        }

        // situation C: some scenarios principal is a String directly
        if (principal instanceof String username) {
            return userRepository.findByUsername(username)
                    .map(User::getId)
                    .orElseThrow(() -> new IllegalStateException("User not found by username: " + username));
        }

        throw new IllegalStateException("Unsupported principal type: " + principal.getClass());
    }
}
