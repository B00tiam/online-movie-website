package movie.project.backend.bootstrap;

import movie.project.backend.domain.User;
import movie.project.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminBootstrapConfig {

    @Bean
    ApplicationRunner initAdminUser(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.username}") String username,
            @Value("${app.admin.email}") String email,
            @Value("${app.admin.password}") String rawPassword
    ) {
        return args -> {
            if (userRepository.countByRole("ADMIN") > 0) return;

            if (userRepository.findByUsername(username).isPresent()) return;

            User admin = new User();
            admin.setUsername(username);
            admin.setEmail(email);
            admin.setPassword(passwordEncoder.encode(rawPassword));
            admin.setRole("ADMIN");
            admin.setEnabled(true);

            userRepository.save(admin);
        };
    }
}
