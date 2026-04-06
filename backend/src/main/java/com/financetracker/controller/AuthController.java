package com.financetracker.controller;
import com.financetracker.dto.*;
import com.financetracker.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    @PostMapping("/register") public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req){return ResponseEntity.ok(authService.register(req));}
    @PostMapping("/login") public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest req){return ResponseEntity.ok(authService.login(req));}
}
