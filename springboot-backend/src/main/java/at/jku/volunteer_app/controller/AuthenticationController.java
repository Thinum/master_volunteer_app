package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.contract.AuthToken;
import at.jku.volunteer_app.contract.AuthUserDTO;
import at.jku.volunteer_app.service.JwtService;
import at.jku.volunteer_app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.security.auth.login.LoginException;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {
    @Autowired
    private JwtService jwtService;
    @Autowired
    private UserService userService;
    @Autowired
    PasswordEncoder encoder;

    @PostMapping("/login")
    public AuthToken login(@RequestBody AuthUserDTO authUser) throws LoginException {
        UserDetails dbUser = userService.loadUserByUsername(authUser.getUsername());
        if(encoder.matches(authUser.getPassword(), dbUser.getPassword())){
            String token = jwtService.generateToken(authUser.getUsername());
            return new AuthToken(token, jwtService.extractExpiration(token));
        } else {
            throw new LoginException("Password is incorrect");
        }
    }
}
