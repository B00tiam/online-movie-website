package movie.project.backend.controller.admin;

import jakarta.validation.Valid;
import movie.project.backend.domain.dto.admin.AdminUserView;
import movie.project.backend.domain.dto.admin.SetUserEnabledRequest;
import movie.project.backend.domain.dto.admin.SetUserRoleRequest;
import movie.project.backend.service.admin.AdminUserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    // - list users
    @GetMapping
    public List<AdminUserView> listUsers() {
        return adminUserService.listUsers();
    }

    // - enable/disable user
    @PatchMapping("/{id}/enabled")
    public AdminUserView setEnabled(@PathVariable String id,
                                    @Valid @RequestBody SetUserEnabledRequest req) {
        return adminUserService.setEnabled(id, req);
    }

    // - set user role
    @PatchMapping("/{id}/role")
    public AdminUserView setRole(@PathVariable String id,
                                 @Valid @RequestBody SetUserRoleRequest req) {
        return adminUserService.setRole(id, req);
    }

    // funcs that can be added later:
    // - delete user
    // - change password
    // - change email

}
