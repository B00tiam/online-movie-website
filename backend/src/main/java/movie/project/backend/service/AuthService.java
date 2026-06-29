package movie.project.backend.service;

import movie.project.backend.config.JwtUtil;
import movie.project.backend.domain.User;
import movie.project.backend.domain.dto.AuthResponse;
import movie.project.backend.domain.dto.LoginRequest;
import movie.project.backend.domain.dto.RegisterRequest;
import movie.project.backend.domain.dto.ProfileResponse;
import movie.project.backend.domain.dto.UpdateProfileRequest;
import movie.project.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    // login a user
    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsernameOrEmail(),
                        loginRequest.getPassword()
                )
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);
        
        User user = (User) userDetails;
        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole());
    }

    // register a new user
    public AuthResponse register(RegisterRequest registerRequest) {
        // check if username already exists
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Username already exists!");
        }

        // check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email has been registered!");
        }

        // create a new user
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole("USER");
        user.setEnabled(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        // generate JWT token
        String token = jwtUtil.generateToken(user);

        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole());
    }

    // delete current user
    public void deleteCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
            throw new IllegalStateException("Unauthenticated.");
        }

        String username = auth.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        if ("ADMIN".equals(user.getRole()) && userRepository.countByRole("ADMIN") <= 1) {
            throw new IllegalStateException("Cannot delete the last ADMIN.");
        }

        userRepository.delete(user);
    }

    // get current user profile
    public ProfileResponse getProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        return new ProfileResponse(
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getBirthday() != null ? user.getBirthday().toString() : null,
                user.getGender()
        );
    }

    // update birthday and gender
    public ProfileResponse updateProfile(UpdateProfileRequest req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        if (req.getBirthday() != null && !req.getBirthday().isBlank()) {
            user.setBirthday(LocalDate.parse(req.getBirthday()));
        } else {
            user.setBirthday(null);
        }

        if (req.getGender() != null && !req.getGender().isBlank()) {
            user.setGender(req.getGender().trim());
        } else {
            user.setGender(null);
        }

        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return new ProfileResponse(
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getBirthday() != null ? user.getBirthday().toString() : null,
                user.getGender()
        );
    }


}
