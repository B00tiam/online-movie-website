package movie.project.backend.service.admin;

import movie.project.backend.domain.User;
import movie.project.backend.domain.dto.admin.AdminUserView;
import movie.project.backend.domain.dto.admin.SetUserEnabledRequest;
import movie.project.backend.domain.dto.admin.SetUserRoleRequest;
import movie.project.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class AdminUserService {

    private static final Set<String> ALLOWED_ROLES = Set.of("USER", "ADMIN");

    private final UserRepository userRepository;

    public AdminUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<AdminUserView> listUsers() {
        return userRepository.findAll().stream().map(this::toView).toList();
    }

    public AdminUserView setEnabled(String id, SetUserEnabledRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        if ("ADMIN".equals(user.getRole()) && !req.isEnabled()) {
            if (userRepository.countByRole("ADMIN") <= 1) {
                throw new IllegalStateException("Cannot disable the last ADMIN user.");
            }
        }

        user.setEnabled(req.isEnabled());
        user.setUpdatedAt(LocalDateTime.now());
        return toView(userRepository.save(user));
    }

    public AdminUserView setRole(String id, SetUserRoleRequest req) {
        String newRole = req.getRole().trim().toUpperCase();
        if (!ALLOWED_ROLES.contains(newRole)) {
            throw new IllegalArgumentException("Invalid role: " + req.getRole());
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        if ("ADMIN".equals(user.getRole()) && "USER".equals(newRole)) {
            if (userRepository.countByRole("ADMIN") <= 1) {
                throw new IllegalStateException("Cannot downgrade the last ADMIN user.");
            }
        }

        user.setRole(newRole);
        user.setUpdatedAt(LocalDateTime.now());
        return toView(userRepository.save(user));
    }

    private AdminUserView toView(User u) {
        AdminUserView v = new AdminUserView();
        v.setId(u.getId());
        v.setUsername(u.getUsername());
        v.setEmail(u.getEmail());
        v.setRole(u.getRole());
        v.setEnabled(u.isEnabled());
        return v;
    }
}
