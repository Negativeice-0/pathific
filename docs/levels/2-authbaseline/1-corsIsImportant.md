#Backend is usually the culprit
Use the below for a deatiled stack trace.
lsetga@lsetga:~/Advance/ambrosia/pathific$ curl -i http://localhost:8080/api/learnmore

### **What Was Wrong**

Your version was **missing the `CorsConfigurationSource` bean**. Here's why it failed:

| Issue | Impact |
|-------|--------|
| **No `CorsConfigurationSource` bean defined** | Spring Security had no CORS policy to apply; defaults to rejecting cross-origin requests |
| **`cors(Customizer.withDefaults())` alone isn't enough** | Without a bean, it looks for default config (which doesn't exist) and fails silently |
| **Browser preflight (OPTIONS) rejected** | Frontend's preflight request gets 403 before actual request is sent |
| **`Authorization` header not whitelisted** | JWT tokens in headers were blocked |

**Result:** 403 Forbidden on all cross-origin requests from `localhost:3000`.

---

### **Merged & Commented Version**

```java
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

        // Registration & Login endpoints (always public)
        .requestMatchers("/api/auth/**").permitAll()

        // Later: you can add admin-only rules here, e.g.:
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


Key Fixes & Why They Solve 403
Added CorsConfigurationSource bean
Defines CORS policy explicitly
✅ Yes
setAllowedOrigins(List.of("http://localhost:3000"))
Allows frontend origin
✅ Yes
setAllowedMethods(...) with OPTIONS
Allows preflight requests
✅ Yes
setAllowedHeaders(List.of("*"))
Allows
Authorization
header for JWT
✅ Yes
setAllowCredentials(true)
Allows sending cookies/JWT tokens
✅ Yes
cors(Customizer.withDefaults())
Applies CORS config (must have bean)
✅ Yes
Final Notes
/api/learnmore is now accessible from localhost:3000 without CORS errors.
JWT tokens in Authorization header are allowed.
Frontend can make direct requests to http://localhost:8080/api/learnmore or via Next.js proxy.
No need for next.config.js rewrites if using direct calls (but proxy is still recommended).
This config is production-ready for local development. For production, replace localhost:3000 with your actual frontend domain.

# # Key tweaks explained # #
.requestMatchers(HttpMethod.GET, "/api/learnmore").permitAll()  
→ Explicitly allows the Learn More endpoint to be accessed without auth. This is your “first page” hook.

.requestMatchers("/api/auth/**").permitAll()  
→ Keeps register/login open so users can sign up.

.anyRequest().authenticated()  
→ Everything else (like /api/users/**, /api/home, etc.) requires JWT. This is where you’ll later enforce admin vs user roles.

Future admin rule:
Add .requestMatchers("/api/users/**").hasRole("ADMIN") once you wire role‑based access.

