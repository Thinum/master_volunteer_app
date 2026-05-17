package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.contract.AddFriendRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import at.jku.volunteer_app.model.User;
import at.jku.volunteer_app.service.UserService;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    UserService userService;

    @PostMapping
    public String addNewUser(@RequestBody User user) {
        return userService.addUser(user);
    }

    @PostMapping("/addFriend")
    public boolean addFriend(@RequestBody AddFriendRequest request) {
        return userService.addFriend(request.userId(), request.friendUserId());
    }
}
