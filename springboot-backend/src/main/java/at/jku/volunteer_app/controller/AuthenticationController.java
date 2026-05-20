package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.contract.AuthToken;
import at.jku.volunteer_app.contract.AuthUserDTO;
import at.jku.volunteer_app.contract.RegisterUserDTO;
import at.jku.volunteer_app.model.User;
import at.jku.volunteer_app.service.JwtService;
import at.jku.volunteer_app.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import javax.security.auth.login.LoginException;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    private final JwtService jwtService;
    private final UserService userService;
    private final PasswordEncoder encoder;

    public AuthenticationController(JwtService jwtService, UserService userService, PasswordEncoder encoder) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.encoder = encoder;
    }

    @PostMapping("/login")
    public AuthToken login(@RequestBody AuthUserDTO authUser) throws LoginException {
        try {
            UserDetails dbUser = userService.loadUserByUsername(authUser.getUsername());
            if (encoder.matches(authUser.getPassword(), dbUser.getPassword())) {
                String token = jwtService.generateToken(authUser.getUsername());
                return new AuthToken(token, jwtService.extractExpiration(token));
            } else {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
            }
        } catch (UsernameNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }
    }

    @PostMapping("/register")
    public AuthToken register(@RequestBody RegisterUserDTO registerUserDTO) throws LoginException {
        try {
            userService.loadUserByUsername(registerUserDTO.getUsername());
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        } catch (UsernameNotFoundException e) {
            // User does not exist, proceed with registration
            User userToAdd = new User();
            userToAdd.setUsername(registerUserDTO.getUsername());
            userToAdd.setPassword(registerUserDTO.getPassword());
            userToAdd.setEmail(registerUserDTO.getEmail());
            userService.addUser(userToAdd);
            String token = jwtService.generateToken(userToAdd.getUsername());
            return new AuthToken(token, jwtService.extractExpiration(token));
        }
    }
}
