package com.financetracker.security;

import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * CWE-672 fix: tracks revoked JWT tokens so they cannot be used after logout.
 * Entries are cleaned up lazily once their natural expiry has passed.
 */
@Service
public class TokenBlacklistService {

    // token string → Instant of the token's own expiration
    private final ConcurrentHashMap<String, Instant> blacklistedTokens = new ConcurrentHashMap<>();

    /**
     * Revoke {@code token}; {@code expiration} is the token's own expiry
     * so the entry can be discarded once the token would be invalid anyway.
     */
    public void blacklist(String token, Instant expiration) {
        blacklistedTokens.put(token, expiration);
    }

    /**
     * Returns {@code true} if the token has been explicitly revoked AND has not yet
     * naturally expired (expired tokens are already rejected by signature validation).
     */
    public boolean isBlacklisted(String token) {
        Instant expiry = blacklistedTokens.get(token);
        if (expiry == null) {
            return false;
        }
        // Lazy cleanup: if the token has expired on its own it no longer needs tracking
        if (Instant.now().isAfter(expiry)) {
            blacklistedTokens.remove(token);
            return false;
        }
        return true;
    }
}
