package com.angarita.empresa.dto;

public class AuthResponse {

    private String token;
    private String refreshToken;

    public AuthResponse() {
    }

    public AuthResponse(String token, String refreshToken) {
        this.token = token;
        this.refreshToken = refreshToken;
    }

    // Constructor a nga agpakabael a mangawat laeng iti token no kasapulan
    public AuthResponse(String token) {
        this.token = token;
        this.refreshToken = null;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}