package com.pathific.app.security;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  /**
   * Password encoder for user credentials (bcrypt).
   * Used during registration and login validation.
   */
  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  /**
   * JWT service bean for token generation and validation.
   * Reads secret, issuer, and expiration from application.yml.
   */
  @Bean
  public JwtService jwtService(
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.issuer}") String issuer,
      @Value("${app.jwt.expiresMinutes}") long expiresMinutes
  ) {
    return new JwtService(secret, issuer, expiresMinutes);
  }

  /**
   * CORS configuration source.
   * Explicitly allows frontend (localhost:3000) to make cross-origin requests.
   */
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();

    // Allow requests from frontend
    config.setAllowedOrigins(List.of("http://localhost:3000"));

    // Allow standard HTTP methods (OPTIONS needed for preflight)
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

    // Allow headers required for JWT and form data
    config.setAllowedHeaders(List.of("*"));

    // Allow credentials (JWT in Authorization header)
    config.setAllowCredentials(true);

    // Cache preflight response for 1 hour
    config.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);

    return source;
  }

  /**
   * Security filter chain.
   * Configures authentication, authorization, and CORS.
   */
  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
      // Disable CSRF: we're using stateless JWT, not session cookies
      .csrf(csrf -> csrf.disable())

      // Enable CORS using the bean defined above
      .cors(Customizer.withDefaults())

      // Authorization rules
      .authorizeHttpRequests(auth -> auth
        // Health checks (always public)
        .requestMatchers("/actuator/**").permitAll()

        // Learn More page (always public, so visitors can see what Pathific is about)
        .requestMatchers(HttpMethod.GET, "/api/learnmore").permitAll()
        //below we are making api/me public to all to finish app quickly
        .requestMatchers(HttpMethod.GET, "/api/me").permitAll()

        // Registration & Login endpoints (always public)
        .requestMatchers("/api/auth/**").permitAll()

      .requestMatchers("/api/courts/**").permitAll()
      .requestMatchers("/api/modules/**").permitAll() 
      .requestMatchers("/api/module-items/**").permitAll() 
      .requestMatchers("/api/completions/**").permitAll() 
      .requestMatchers("/api/payments/**").permitAll()

        // Later: you can add admin-only rules here, e.g.: --uncomment below to add.
        // .requestMatchers("/api/users/**").hasRole("ADMIN")

        // Everything else requires authentication
        .anyRequest().authenticated()
      )

      // Disable basic auth and form login (we're using JWT)
      .httpBasic(basic -> basic.disable())
      .formLogin(form -> form.disable());

    return http.build();
  }
}
