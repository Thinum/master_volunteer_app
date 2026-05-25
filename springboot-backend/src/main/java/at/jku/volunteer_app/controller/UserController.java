package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.contract.AddFriendRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import at.jku.volunteer_app.model.User;
import at.jku.volunteer_app.service.UserService;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final at.jku.volunteer_app.service.OrganisationService organisationService;
    private final at.jku.volunteer_app.service.ActivityService activityService;

    public UserController(UserService userService, 
                          at.jku.volunteer_app.service.OrganisationService organisationService,
                          at.jku.volunteer_app.service.ActivityService activityService) {
        this.userService = userService;
        this.organisationService = organisationService;
        this.activityService = activityService;
    }

    @GetMapping("/me")
    public User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        return user;
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

    @GetMapping("/{id}/friends")
    public List<User> getFriends(@PathVariable int id) {
        return userService.getFriends(id);
    }

    @GetMapping("/{id}/organisations")
    public List<at.jku.volunteer_app.model.Organisation> getOrganisations(@PathVariable int id) {
        User user = userService.getUserById(id);
        if (user == null) return List.of();
        return organisationService.getOrganisationsForUser(user);
    }

    @GetMapping("/{id}/activities")
    public List<at.jku.volunteer_app.model.Activity> getActivities(@PathVariable int id) {
        User user = userService.getUserById(id);
        if (user == null) return List.of();
        return activityService.getActivitiesForUser(user);
    }

    @GetMapping("/active")
    public List<User> getActiveUsers() {
        return userService.getActiveUsers();
    }
}
