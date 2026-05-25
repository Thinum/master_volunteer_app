package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.contract.AddFriendRequest;
import org.springframework.web.bind.annotation.*;
import at.jku.volunteer_app.model.User;
import at.jku.volunteer_app.service.UserService;
import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public String addNewUser(@RequestBody User user) {
        return userService.addUser(user);
    }

    @PostMapping("/addFriend")
    public boolean addFriend(@RequestBody AddFriendRequest request) {
        return userService.addFriend(request.userId(), request.friendUserId());
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable int id) {
        return userService.getUserById(id);
    }

    @GetMapping("/active")
    public List<User> getActiveUsers() {
        return userService.getActiveUsers();
    }
}
