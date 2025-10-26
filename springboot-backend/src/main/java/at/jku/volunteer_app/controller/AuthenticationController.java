package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.contract.AuthUserDTO;
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
import java.util.Map;

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
    public Map<String, String> login(@RequestBody AuthUserDTO authUser) throws LoginException {
        UserDetails dbUser = userService.loadUserByUsername(authUser.getUsername());
        if(encoder.matches(authUser.getPassword(), dbUser.getPassword())){
            String token = jwtService.generateToken(authUser.getUsername());
            return Map.of("token", token);
        } else {
            throw new LoginException("Password is incorrect");
        }
    }
}
