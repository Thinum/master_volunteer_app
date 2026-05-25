package at.jku.volunteer_app.filters;

import at.jku.volunteer_app.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException; 
import jakarta.servlet.http.HttpServletRequest; 
import jakarta.servlet.http.HttpServletResponse;
import at.jku.volunteer_app.service.JwtService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter; 

import java.io.IOException; 


// This class helps us to validate the generated jwt token 
@Component
public class JwtAuthFilter extends OncePerRequestFilter { 

    private final JwtService jwtService;
    private final UserService userService;

    public JwtAuthFilter(JwtService jwtService, UserService userService) {
        this.jwtService = jwtService;
        this.userService = userService;
    }


	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
		try {
			String authHeader = request.getHeader("Authorization"); 
			String token = null; 
			String username = null; 
			if (authHeader != null && authHeader.startsWith("Bearer ")) { 
				token = authHeader.substring(7); 
				username = jwtService.extractUsername(token); 
			} 
			if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
				UserDetails userDetails = userService.loadUserByUsername(username);
				if (jwtService.validateToken(token, userDetails)) { 
					UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
					authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
					SecurityContextHolder.getContext().setAuthentication(authToken); 
				} 
			}
		} catch (Exception e) {
			// Ignore token validation errors. If authentication is required, 
			// Spring Security will reject the request later in the filter chain.
		}

		filterChain.doFilter(request, response);
	}}
