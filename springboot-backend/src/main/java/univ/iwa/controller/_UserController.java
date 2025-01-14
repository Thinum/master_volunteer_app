package univ.iwa.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import univ.iwa.model._User;
import univ.iwa.service._UserService;

@RestController
@RequestMapping("/users")
public class _UserController {

    @Autowired
    _UserService userService;

    @PostMapping
    public String addNewUser(@RequestBody _User user) {
        return userService.addUser(user);
    }
}
