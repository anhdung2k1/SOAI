package com.example.authentication.config;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private final JwtService jwtService;
    @Autowired
    private final UserDetailsService userDetailsService;
    /**
     * Processes incoming HTTP requests to perform JWT-based authentication.
     *
     * Extracts a JWT token from the "Authorization" header or an "Authorization" cookie if the header is absent.
     * If a valid JWT is found, authenticates the user by validating the token and setting the authentication in the security context.
     * Continues the filter chain regardless of authentication outcome.
     *
     * @param request  the HTTP request
     * @param response the HTTP response
     * @param filterChain the filter chain to continue processing
     * @throws ServletException if an error occurs during filtering
     * @throws IOException if an I/O error occurs during filtering
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Support token from cookie if Authorization header is missing
        if (authHeader == null) {
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if (cookie.getName().equals("Authorization")) {
                        authHeader = "Bearer " + cookie.getValue();
                        break;
                    }
                }
            }
        }

        final String jwt;
        final String userName;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        userName = jwtService.extractUsername(jwt);
        String role = jwtService.extractRole(jwt);

        if (userName != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userName);
            if (jwtService.isTokenValid(jwt, userDetails)) {
                List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(role));
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        authorities
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Determines whether the JWT authentication filter should be skipped for the given request.
     *
     * The filter is bypassed for requests whose servlet path starts with any of the following public endpoint prefixes:
     * "/api/v1/authentications/signin", "/api/v1/authentications/signup", "/api/v1/authentications/docs",
     * "/api/v1/authentications/swagger-ui", or "/actuator".
     *
     * @param request the current HTTP request
     * @return true if the filter should be skipped for this request; false otherwise
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return List.of(
                "/api/v1/authentications/signin",
                "/api/v1/authentications/signup",
                "/api/v1/authentications/docs",
                "/api/v1/authentications/swagger-ui",
                "/actuator"
        ).stream().anyMatch(path::startsWith);
    }
}
