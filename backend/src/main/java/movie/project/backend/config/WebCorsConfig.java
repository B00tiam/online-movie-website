package movie.project.backend.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;


@Configuration
public class WebCorsConfig {

    /*
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsCfg = new CorsConfiguration();
        // frontend & ngrok config
        corsCfg.setAllowedOriginPatterns(List.of(
                "http://localhost:3000",
                "https://*.ngrok.io"
        ));
        corsCfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        corsCfg.setAllowedHeaders(List.of("*"));
        corsCfg.setAllowCredentials(true);
        corsCfg.setMaxAge(3600L);   // 1 hour to buffer

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsCfg);

        return source;
    }
    */
}
