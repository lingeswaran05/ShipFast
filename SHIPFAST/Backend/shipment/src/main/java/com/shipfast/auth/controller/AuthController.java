package com.shipfast.auth.controller;

import com.shipfast.auth.dto.*;
import com.shipfast.auth.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(
            @RequestBody RegisterRequest request) {

        return new ApiResponse<>(true,
                "Registration successful",
                service.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(
            @RequestBody LoginRequest request) {

        return new ApiResponse<>(true,
                "Login successful",
                service.login(request));
    }
}
