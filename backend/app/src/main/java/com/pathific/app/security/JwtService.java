package com.pathific.app.security;

import java.time.Instant;
import java.util.Date;
import java.util.Map;

import javax.crypto.SecretKey;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

public class JwtService {
  private final SecretKey key;
  private final String issuer;
  private final long expiresMinutes;

  public JwtService(String secret, String issuer, long expiresMinutes) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes());
    this.issuer = issuer;
    this.expiresMinutes = expiresMinutes;
  }

  public String generateToken(String subject, Map<String, Object> claims) {
    Instant now = Instant.now();
    Instant exp = now.plusSeconds(expiresMinutes * 60);
    return Jwts.builder()
      .setIssuer(issuer)
      .setSubject(subject)
      .addClaims(claims)
      .setIssuedAt(Date.from(now))
      .setExpiration(Date.from(exp))
      .signWith(key, SignatureAlgorithm.HS256)
      .compact();
  }

  public io.jsonwebtoken.Claims parse(String token) {
    return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
  }
}
