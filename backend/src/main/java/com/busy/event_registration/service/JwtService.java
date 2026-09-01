package com.busy.event_registration.service;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;


@Service
public class JwtService {
    private final SecretKey secretKey;
    private final long expiration;

    public JwtService(@Value("${jwt.secret}") String secret, @Value("${jwt.expiration}") long expiration){
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration = expiration;
    }

    public String generateToken(Long userId, String email, String role){
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder().subject(String.valueOf(userId))
                             .claim("email", email)
                             .claim("role", role)
                             .issuedAt(now)
                             .expiration(expiryDate)
                             .signWith(secretKey)
                             .compact();
    }
    public Claims extractClaims(String token){
        return Jwts.parser().verifyWith(secretKey)
                            .build()
                            .parseSignedClaims(token)
                            .getPayload();
    }
}
