package movie.project.backend.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

// Lombok & MongoDB annotations:
@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "users")
public class User implements UserDetails {

    @Id
    private String id;

    @NotBlank(message = "Username cannot be empty!")
    @Size(min = 3, max = 20, message = "Username length must be 3-20 characters!")
    @Indexed(unique = true)     // unique index, prohibits duplicate
    private String username;

    @NotBlank(message = "Email cannot be empty!")
    @Email(message = "Email format incorrect!")
    @Indexed(unique = true)
    private String email;

    @NotBlank(message = "Password cannot be empty!")
    @Size(min = 6, message = "Password length shall not be less than 6 characters!")
    private String password;

    private String role = "USER";
    
    private boolean enabled = true;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt = LocalDateTime.now();

    // UserDetails implementation
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
