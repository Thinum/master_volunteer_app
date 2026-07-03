package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.contract.AddFriendRequest;
import at.jku.volunteer_app.contract.ActivityDTO;
import at.jku.volunteer_app.contract.ContractMapper;
import at.jku.volunteer_app.contract.OrganisationDTO;
import at.jku.volunteer_app.model.RelationshipType;
import at.jku.volunteer_app.service.OrganisationService;
import at.jku.volunteer_app.service.ActivityService;
import at.jku.volunteer_app.contract.RelationshipDTO;
import at.jku.volunteer_app.contract.UserDTO;
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
    private final OrganisationService organisationService;
    private final ActivityService activityService;

    public UserController(UserService userService, 
                          OrganisationService organisationService,
                          ActivityService activityService) {
        this.userService = userService;
        this.organisationService = organisationService;
        this.activityService = activityService;
    }

    @GetMapping("/me")
    public UserDTO getCurrentUser(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ContractMapper.toUserDTO(user);
    }

    @PutMapping("/me")
    public UserDTO updateCurrentUser(Authentication authentication, @RequestBody UserDTO user) {
        User currentUser = getAuthenticatedUser(authentication);
        User updatedUser = userService.updateUserProfile(currentUser.getId(), ContractMapper.toUserEntity(user));
        return ContractMapper.toUserDTO(updatedUser);
    }

    @PostMapping
    public String addNewUser(@RequestBody UserDTO user) {
        return userService.addUser(ContractMapper.toUserEntity(user));
    }

    @PostMapping("/addFriend")
    public boolean addFriend(@RequestBody AddFriendRequest request) {
        return userService.addFriend(request.userId(), request.friendUserId());
    }

    @GetMapping
    public List<UserDTO> getAllUsers() {
        return ContractMapper.toUserDTOList(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public UserDTO getUserById(@PathVariable int id) {
        return ContractMapper.toUserDTO(userService.getUserById(id));
    }

    @GetMapping("/{id}/friends")
    public List<UserDTO> getFriends(@PathVariable int id) {
        return ContractMapper.toUserDTOList(userService.getFriends(id));
    }

    @GetMapping("/{id}/relationships")
    public List<RelationshipDTO> getRelationshipsForGraph(@PathVariable int id) {
        return userService.getRelationshipsForGraph(id);
    }

    @GetMapping("/{id}/organisations")
    public List<OrganisationDTO> getOrganisations(@PathVariable int id) {
        User user = userService.getUserById(id);
        if (user == null) return List.of();
        return ContractMapper.toOrganisationDTOList(organisationService.getOrganisationsForUser(user));
    }

    @GetMapping("/{id}/activities")
    public List<ActivityDTO> getActivities(@PathVariable int id) {
        User user = userService.getUserById(id);
        if (user == null) return List.of();
        return ContractMapper.toActivityDTOList(activityService.getActivitiesForUser(user));
    }

    @GetMapping("/active")
    public List<UserDTO> getActiveUsers() {
        return ContractMapper.toUserDTOList(userService.getActiveUsers());
    }

    @GetMapping("/{id}/relationships/{type}")
    public List<UserDTO> getByType(
            @PathVariable int id,
            @PathVariable RelationshipType type
    ) {
        return ContractMapper.toUserDTOList(userService.getRelatedUsers(id, type));
    }

    @GetMapping("/{id}/connections")
    public List<UserDTO> getAllConnectedUsers(@PathVariable int id) {
        return ContractMapper.toUserDTOList(userService.getAllConnectedUsers(id));
    }

    private User getAuthenticatedUser(Authentication authentication) {
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
}
