package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.model.User;
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

    @PostMapping
    public String login(@RequestBody User user) throws LoginException {
        UserDetails dbUser = userService.loadUserByUsername(user.getUsername());
        if(encoder.matches(user.getPassword(), dbUser.getPassword())){
            return jwtService.generateToken(user.getUsername());
        } else {
            throw new LoginException("Password is incorrect");
        }
    }
}
