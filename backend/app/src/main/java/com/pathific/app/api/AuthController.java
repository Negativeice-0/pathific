package com.pathific.app.api;

import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pathific.app.security.JwtService;
import com.pathific.app.users.UserRepository;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final UserRepository users;
  private final PasswordEncoder encoder;
  private final JwtService jwt;

  public AuthController(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
    this.users = users;
    this.encoder = encoder;
    this.jwt = jwt;
  }

  @PostMapping("/register")
  public Map<String, Object> register(@RequestBody Map<String, String> body) {
    String externalId = body.getOrDefault("id", null);
    String name = body.get("name");
    String email = body.get("email");
    String password = body.get("password");
    String confirm = body.getOrDefault("confirmPassword", password);
    String city = body.getOrDefault("city", null);
    String level = body.getOrDefault("level", null);
    String role = body.getOrDefault("role", "user");

    if (name == null || email == null || password == null) {
      return Map.of("ok", false, "error", "Missing required fields");
    }
    if (!password.equals(confirm)) {
      return Map.of("ok", false, "error", "Passwords do not match");
    }
    if (users.findByEmail(email) != null) {
      return Map.of("ok", false, "error", "Email already registered");
    }

    String hash = encoder.encode(password);
    users.createUser(externalId, name, email, hash, city, level, role);

    Map<String, Object> claims = Map.of("email", email, "role", role, "name", name);
    String token = jwt.generateToken(email, claims);

    return Map.of("ok", true, "token", token);
  }

  @PostMapping("/login")
  public Map<String, Object> login(@RequestBody Map<String, String> body) {
    String email = body.get("email");
    String password = body.get("password");

    if (email == null || password == null) {
      return Map.of("ok", false, "error", "Missing credentials");
    }

    Map<String, Object> user = users.findByEmail(email);
    if (user == null) {
      return Map.of("ok", false, "error", "Invalid credentials");
    }

    String hash = (String) user.get("password_hash");
    String role = (String) user.get("role");
    String name = (String) user.get("name");

    if (!encoder.matches(password, hash)) {
      return Map.of("ok", false, "error", "Invalid credentials");
    }

    Map<String, Object> claims = Map.of("email", email, "role", role, "name", name);
    String token = jwt.generateToken(email, claims);

    return Map.of("ok", true, "token", token);
  }
}
