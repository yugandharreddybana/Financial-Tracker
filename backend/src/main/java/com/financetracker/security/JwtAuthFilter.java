package com.financetracker.security;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
@Component @RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest req, @NonNull HttpServletResponse res, @NonNull FilterChain chain) throws ServletException, IOException {
        final String auth = req.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) { chain.doFilter(req,res); return; }
        final String token = auth.substring(7);
        try {
            String email = jwtUtil.extractUsername(token);
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails ud = userDetailsService.loadUserByUsername(email);
                if (jwtUtil.isTokenValid(token, ud)) {
                    var a = new UsernamePasswordAuthenticationToken(ud, null, ud.getAuthorities());
                    a.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                    SecurityContextHolder.getContext().setAuthentication(a);
                }
            }
        } catch(Exception ignored){}
        chain.doFilter(req,res);
    }
}
