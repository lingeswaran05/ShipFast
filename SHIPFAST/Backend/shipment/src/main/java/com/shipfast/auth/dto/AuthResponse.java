package com.shipfast.auth.dto;

public class AuthResponse {

    private String userId;
    private String email;
    private String role;
    private String accessToken;

    public AuthResponse(String userId, String email, String role, String accessToken) {
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.accessToken = accessToken;
    }

    public String getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getAccessToken() { return accessToken; }
}
