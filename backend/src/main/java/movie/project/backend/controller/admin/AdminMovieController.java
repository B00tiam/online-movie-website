package movie.project.backend.controller.admin;

import movie.project.backend.domain.Movie;
import movie.project.backend.service.admin.AdminMovieService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/admin/movies")
@PreAuthorize("hasRole('ADMIN')")
public class AdminMovieController {

    private final AdminMovieService adminMovieService;

    public AdminMovieController(AdminMovieService adminMovieService) {
        this.adminMovieService = adminMovieService;
    }

    @GetMapping
    public List<Movie> list(@RequestParam(required = false) String q) {
        return adminMovieService.list(q);
    }

    @PostMapping("/import/tmdb/{tmdbId}")
    public Movie importFromTmdb(@PathVariable long tmdbId) {
        return adminMovieService.importFromTmdb(tmdbId);
    }

    @DeleteMapping("/{imdbId}")
    public void delete(@PathVariable String imdbId) {
        adminMovieService.deleteByImdbId(imdbId);
    }
}
