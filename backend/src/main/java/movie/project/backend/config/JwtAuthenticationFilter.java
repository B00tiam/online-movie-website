package movie.project.backend.config;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String jwt = getJwtFromRequest(request);

        if (StringUtils.hasText(jwt)) {
            try {
                // Check if the JWT signature is valid
                if (!jwtUtil.isTokenSignatureValid(jwt)) {
                    sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Invalid JWT signature");
                    return;
                }

                // Check if the JWT token is expired, if so, return 401 Unauthorized
                if (jwtUtil.isTokenExpired(jwt)) {
                    sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "JWT token has expired, please login again");
                    return;
                }

                String username = jwtUtil.extractUsername(jwt);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    if (jwtUtil.validateToken(jwt, userDetails)) {
                        UsernamePasswordAuthenticationToken authenticationToken =
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                    }
                }
//            } catch (ExpiredJwtException ex) {
//                logger.warn("JWT token is expired: {}", ex.getMessage());
//                sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "JWT token has expired, please login again");
//                return;
//            } catch (JwtException ex) {
//                logger.error("Invalid JWT token: {}", ex.getMessage());
//                sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Invalid JWT token");
//                return;
            } catch (Exception ex) {
                logger.error("Unable to set up user authentication: {}", ex);
                sendErrorResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, "Authentication error");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    // Write a standard JSON error response to the client
    private void sendErrorResponse(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        String jsonBody = String.format("{\"error\": \"%s\", \"status\": %d}", message, status.value());
        response.getWriter().write(jsonBody);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
