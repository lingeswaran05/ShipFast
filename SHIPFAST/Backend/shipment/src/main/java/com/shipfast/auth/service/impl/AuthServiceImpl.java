package com.shipfast.auth.service.impl;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.shipfast.auth.dto.AuthResponse;
import com.shipfast.auth.dto.LoginRequest;
import com.shipfast.auth.dto.RegisterRequest;
import com.shipfast.auth.entity.UserAuth;
import com.shipfast.auth.enums.UserRole;
import com.shipfast.auth.repository.UserAuthRepository;
import com.shipfast.auth.service.AuthService;
import com.shipfast.auth.service.JwtTokenService;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserAuthRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;

    public AuthServiceImpl(UserAuthRepository repository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenService jwtTokenService) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
    }

    @Override
    public AuthResponse register(RegisterRequest request) {

        if (repository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        UserAuth user = new UserAuth();
        user.setUserId("u" + UUID.randomUUID().toString().substring(0,8));
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.valueOf(request.getRole().toUpperCase()));
        user.setCreatedAt(LocalDateTime.now());

        repository.save(user);

        String token = jwtTokenService.generateToken(user.getUserId(),
                user.getRole().name());

        return new AuthResponse(
                user.getUserId(),
                user.getEmail(),
                user.getRole().name(),
                token
        );
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        UserAuth user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(),
                user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtTokenService.generateToken(user.getUserId(),
                user.getRole().name());

        return new AuthResponse(
                user.getUserId(),
                user.getEmail(),
                user.getRole().name(),
                token
        );
    }
}
