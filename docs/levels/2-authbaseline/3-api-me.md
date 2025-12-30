Got it — let’s get your `/api/me` endpoint back in place so the frontend stops throwing 403s. This endpoint is meant to return basic information about the currently authenticated user (based on the JWT you issue at login).  

---

## 📂 Where to put the code
- Place the file under your backend app source tree:  
  ```
  backend/app/src/main/java/com/pathific/app/api/MeController.java
  ```
- Keep it in the same `api` package as your other controllers (e.g. `AuthController`, `LearnMoreController`).

---

## 📝 Full, commented source code

```java
package com.pathific.app.api;

import com.pathific.app.security.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * MeController
 *
 * Exposes GET /api/me
 * - Reads the Authorization header ("Bearer <token>")
 * - Parses the JWT using JwtService
 * - Returns basic user info (email, role, name) from the token claims
 *
 * This endpoint is useful for the frontend to confirm who is logged in
 * and display personalized information.
 */
@RestController
public class MeController {

    private final JwtService jwt;

    public MeController(JwtService jwt) {
        this.jwt = jwt;
    }

    @GetMapping("/api/me")
    public Map<String, Object> me(HttpServletRequest request) {
        // Extract Authorization header
        String auth = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (auth == null || !auth.startsWith("Bearer ")) {
            // If no token provided, return error
            return Map.of("ok", false, "error", "Missing token");
        }

        String token = auth.substring(7); // remove "Bearer "

        try {
            // Parse JWT claims
            Claims claims = jwt.parse(token);

            // Return user info from claims
            return Map.of(
                "ok", true,
                "email", claims.get("email"),
                "role", claims.get("role"),
                "name", claims.get("name")
            );
        } catch (Exception e) {
            // If token invalid or expired
            return Map.of("ok", false, "error", "Invalid token");
        }
    }
}
```

---

## 🔎 How it works
1. **Frontend** sends request:
   ```http
   GET /api/me
   Authorization: Bearer <jwt-token>
   ```
2. **MeController**:
   - Reads the `Authorization` header.
   - Validates it starts with `"Bearer "`.
   - Passes the token to `JwtService.parse()`.
   - Extracts claims (`email`, `role`, `name`).
   - Returns them as JSON.
3. **Frontend** can then display “Welcome, Billy” or show role‑based UI.

---

## ⚠️ Why you saw 403
- In your `SecurityConfig`, `/api/me` was not explicitly permitted.  
- Since `.anyRequest().authenticated()` is active, Spring Security blocks it if no valid JWT is provided.  
- Once you add this controller, make sure you call it with a valid token (from login/register).  

If you want `/api/me` to be accessible only when logged in (which makes sense), **don’t add it to the permitAll list**. Keep it protected so only authenticated users can hit it.

---

✅ Next step:  
- Add `MeController.java` as shown.  
- Restart backend.  
- From frontend, after login, call `/api/me` with the token in `Authorization` header.  

Would you like me to also show the **frontend hook** (React/Next.js code) that fetches `/api/me` using the stored token, so you can wire it into your Home page quickly?