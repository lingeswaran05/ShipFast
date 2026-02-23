package com.shipfast.auth.service;

import com.shipfast.auth.dto.AuthResponse;
import com.shipfast.auth.dto.LoginRequest;
import com.shipfast.auth.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
