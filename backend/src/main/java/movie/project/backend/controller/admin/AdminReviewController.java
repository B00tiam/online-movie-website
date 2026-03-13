package movie.project.backend.controller.admin;

import movie.project.backend.domain.dto.admin.AdminReviewView;
import movie.project.backend.service.admin.AdminReviewService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reviews")
@PreAuthorize("hasRole('ADMIN')")
public class AdminReviewController {

    private final AdminReviewService adminReviewService;

    public AdminReviewController(AdminReviewService adminReviewService) {
        this.adminReviewService = adminReviewService;
    }

    // - list reviews
    @GetMapping
    public List<AdminReviewView> list(@RequestParam(required = false) String imdbId) {
        return adminReviewService.list(imdbId);
    }

    // - delete some review
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        adminReviewService.delete(id);
    }
}
