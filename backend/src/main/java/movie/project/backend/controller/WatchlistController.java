package movie.project.backend.controller;

import movie.project.backend.domain.Movie;
import movie.project.backend.service.WatchlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/watchlist")
@CrossOrigin(origins = "*")
public class WatchlistController {

    private final WatchlistService watchlistService;

    public WatchlistController(WatchlistService watchlistService) {
        this.watchlistService = watchlistService;
    }

    @GetMapping
    public ResponseEntity<List<Movie>> myWatchlist() {
        return ResponseEntity.ok(watchlistService.getMyWatchlistMovies());
    }

    @PostMapping("/{imdbId}")
    public ResponseEntity<Boolean> add(@PathVariable String imdbId) {
        return ResponseEntity.ok(watchlistService.addToMyWatchlist(imdbId));
    }

    @DeleteMapping("/{imdbId}")
    public ResponseEntity<Boolean> remove(@PathVariable String imdbId) {
        return ResponseEntity.ok(watchlistService.removeFromMyWatchlist(imdbId));
    }

    @GetMapping("/contains/{imdbId}")
    public ResponseEntity<Boolean> contains(@PathVariable String imdbId) {
        return ResponseEntity.ok(watchlistService.isInMyWatchlist(imdbId));
    }
}
