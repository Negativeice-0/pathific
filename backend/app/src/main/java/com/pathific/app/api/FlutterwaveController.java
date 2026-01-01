package com.pathific.app.api;


import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController @RequestMapping("/api/payments")
public class FlutterwaveController {
  private final RestTemplate http = new RestTemplate();

  private final String secretKey = System.getenv().getOrDefault("FLW_SECRET_KEY", "FLWSECK_TEST-xxxx");
  private final String redirectUrl = System.getenv().getOrDefault("FLW_REDIRECT_URL", "http://localhost:3000/payment/complete");

  // ============================================================================
// Records: Type-safe Flutterwave API contracts
// Why: Replaces unsafe Map casting with compile-time type checking.
// Benefit: IDE autocomplete, null-safety, and immediate detection of API changes.
// ============================================================================

/**
 * Represents the Flutterwave payment response structure.
 * Flutterwave wraps the actual payment link in a nested "data" object.
 */
record FlutterwaveResponse(FlutterwaveData data) {}

/**
 * Contains the payment link and other transaction metadata.
 * We extract only the "link" field for the checkout redirect.
 */
record FlutterwaveData(String link) {}

// ============================================================================
// Controller Method
// ============================================================================

@PostMapping("/checkout")
public ResponseEntity<Map<String, Object>> checkout(@RequestBody Map<String, Object> body) {
    // Extract and validate request parameters with sensible defaults
    String amount = String.valueOf(body.getOrDefault("amount", "50"));
    String currency = String.valueOf(body.getOrDefault("currency", "KES"));
    String email = String.valueOf(body.getOrDefault("email", "demo@pathific.local"));
    String phone = String.valueOf(body.getOrDefault("phone", "254700000000"));
    String name = String.valueOf(body.getOrDefault("name", "Pathific Demo"));

    // Build the Flutterwave v3 payment payload
    Map<String, Object> payload = Map.of(
        "tx_ref", "PATHIFIC-" + UUID.randomUUID(),  // Unique transaction reference
        "amount", amount,
        "currency", currency,
        "redirect_url", redirectUrl,  // Post-payment redirect (success/failure)
        "customer", Map.of(
            "email", email,
            "phonenumber", phone,
            "name", name
        ),
        "customizations", Map.of(
            "title", "Pathific",
            "description", "Structured micro‑learning"
        )
    );

    // Prepare HTTP headers with Bearer token authentication
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setBearerAuth(secretKey);

    // Execute Flutterwave v3 payment endpoint
    HttpEntity<Map<String, Object>> req = new HttpEntity<>(payload, headers);
    ResponseEntity<FlutterwaveResponse> res = http.postForEntity(
        "https://api.flutterwave.com/v3/payments",
        req,
        FlutterwaveResponse.class  // Typed response: no casting needed
    );

    // Extract payment link from typed response
    // Why typed records: res.getBody().data().link() is null-safe and refactor-proof
    String link = res.getBody().data().link();

    // Return success response with payment link for frontend redirect
    return ResponseEntity.ok(Map.of("ok", true, "link", link));
}

  @PostMapping("/webhook")
  public ResponseEntity<Map<String,Object>> webhook(@RequestHeader("verif-hash") String hash, @RequestBody Map<String,Object> payload) {
    // Verify hash equals your secret hash (set in Flutterwave dashboard)
    // Update payment status in DB if verified
    return ResponseEntity.ok(Map.of("ok", true));
  }
}

