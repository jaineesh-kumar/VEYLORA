package com.project.backend.Services;


import com.project.backend.Entities.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {


    private final String secretKey;

    private final long refreshExpiration;

    private final long accessExpiration;

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);



    public JwtService(@Value("${jwt.secret}") String secretKey,
                      @Value("${jwt.access.expiration}") long accessExpiration,
                      @Value("${jwt.refresh.expiration}") long refreshExpiration) {
        this.secretKey = secretKey;
        this.accessExpiration = accessExpiration;
        this.refreshExpiration = refreshExpiration;
    }


    public String generateAccessToken(User user) {
        log.info("Inside generateAccessToken");
        return Jwts.builder()
                .subject(user.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    public String generateRefreshToken(User user) {
        log.info("Inside generateRefreshToken");
        return Jwts.builder()
                .subject(user.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token, String username) {
        log.info("Inside validateToken");
        return username.equals(extractUsername(token)) && !isTokenExpired(token);
    }

    public String extractUsername(String token) {
        log.info("Inside extractUsername");
        return extractClaim(token, Claims::getSubject);
    }

    public boolean isTokenExpired(String token) {
        log.info("Inside isTokenExpired");
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        log.info("Inside extractClaim");
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return resolver.apply(claims);
    }

    private SecretKey getSigningKey() {
        log.info("Inside getSigningKey");
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey));
    }
}