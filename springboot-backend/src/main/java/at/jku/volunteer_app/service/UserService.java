package at.jku.volunteer_app.service;

import at.jku.volunteer_app.model.RelationshipType;
import at.jku.volunteer_app.model.UserRelationship;
import at.jku.volunteer_app.repository.UserRelationshipRepository;
import org.springframework.security.core.userdetails.UserDetails;
import at.jku.volunteer_app.contract.RelationshipDTO;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import at.jku.volunteer_app.model.User;
import at.jku.volunteer_app.model.UserModelDetails;
import at.jku.volunteer_app.repository.UserRepository;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository repository;
    private final PasswordEncoder encoder;
    private final UserRelationshipRepository relationshipRepository;

    public UserService(UserRepository repository, PasswordEncoder encoder, UserRelationshipRepository relationshipRepository) {
        this.repository = repository;
        this.encoder = encoder;
        this.relationshipRepository = relationshipRepository;
    }

    @Override
    public UserModelDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return repository.findByUsername(username)
                .map(UserModelDetails::new)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public String addUser(User user) {
        user.setPassword(encoder.encode(user.getPassword()));
        repository.save(user);
        return "User Added Successfully";
    }

    private boolean isBidirectional(RelationshipType type) {
        return switch (type) {
            case FRIEND, PARTNER, SIBLING, RELATIVE -> true;
            case PARENT, CHILD, ACQUAINTANT -> false;
        };
    }

    @Transactional
    public void addRelationship(int userId, int targetId, RelationshipType type) {
        if (userId == targetId) {
            throw new IllegalArgumentException("Cannot create relationship with yourself");
        }

        User user = repository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        User target = repository.findById(targetId)
                .orElseThrow();

        UserRelationship rel = new UserRelationship();
        rel.setFromUser(user);
        rel.setToUser(target);
        rel.setType(type);

        relationshipRepository.save(rel);

        if (isBidirectional(type)) {
            UserRelationship reverse = new UserRelationship();
            reverse.setFromUser(target);
            reverse.setToUser(user);
            reverse.setType(type);
            relationshipRepository.save(reverse);
        }
    }

    public List<RelationshipDTO> getAllRelationships(int userId) {
        User user = repository.findById(userId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND,
                        "User not found with id: " + userId));

        return relationshipRepository.findAll().stream()
                .filter(rel ->
                        rel.getFromUser().getId() == userId ||
                                rel.getToUser().getId() == userId
                )
                .map(rel -> new at.jku.volunteer_app.contract.RelationshipDTO(
                        rel.getId(),
                        rel.getFromUser().getId(),
                        rel.getFromUser().getName(),
                        rel.getToUser().getId(),
                        rel.getToUser().getName(),
                        rel.getType(),
                        rel.getLikeScore()
                ))
                .toList();
    }

    //TODO: replace it with just calling addRelationship(with RelationShipType fiend)
    @Transactional
    public boolean addFriend(int userId, int friendId) {
        if (userId == friendId) {
            throw new IllegalArgumentException("Cannot friend yourself");
        }

        User user = repository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        User friend = repository.findById(friendId)
                .orElseThrow();
        boolean hasFriendRelationship = relationshipRepository.existsFriendship(user, friend, RelationshipType.FRIEND)
                || relationshipRepository.existsFriendship(friend, user, RelationshipType.FRIEND);


        UserRelationship rel1 = new UserRelationship();
        rel1.setFromUser(user);
        rel1.setToUser(friend);
        rel1.setType(RelationshipType.FRIEND);

        UserRelationship rel2 = new UserRelationship();
        rel2.setFromUser(friend);
        rel2.setToUser(user);
        rel2.setType(RelationshipType.FRIEND);

        relationshipRepository.save(rel1);
        relationshipRepository.save(rel2);
        return true;
    }

    public List<User> getRelatedUsers(int userId, RelationshipType type) {
        User user = repository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        return relationshipRepository.findAllByFromUserAndType(user, type)
                .stream()
                .map(UserRelationship::getToUser)
                .toList();
    }

    public List<User> getAllConnectedUsers(int userId) {
        User user = repository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        return relationshipRepository.findAll().stream()
                .filter(rel ->
                        rel.getFromUser().getId() == userId ||
                                rel.getToUser().getId() == userId
                )
                .map(rel -> {
                    if (rel.getFromUser().getId() == userId) {
                        return rel.getToUser();
                    } else {
                        return rel.getFromUser();
                    }
                })
                .distinct()
                .toList();
    }

    public List<User> getAllUsers() {
        return repository.findAll();
    }

    public User getUserById(int id) {
        return repository.findById(id).orElse(null);
    }

    public List<User> getFriends(int userId) {
        return getRelatedUsers(userId, RelationshipType.FRIEND);
    }

    public List<User> getActiveUsers() {
        return repository.findAll().stream().filter(User::isActive).toList();
    }

    public User getUserByUsername(String username) {
        return repository.findByUsername(username).orElse(null);
    }

    @Transactional
    public User updateUserProfile(int userId, User updatedUser) {
        User existingUser = repository.findById(userId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "User not found with id: " + userId));

        existingUser.setName(updatedUser.getName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setPhone(updatedUser.getPhone());
        existingUser.setProfilePicture(updatedUser.getProfilePicture());
        existingUser.setSkills(updatedUser.getSkills() == null ? List.of() : updatedUser.getSkills());
        existingUser.setInterests(updatedUser.getInterests() == null ? List.of() : updatedUser.getInterests());

        return repository.save(existingUser);
    }

    public List<RelationshipDTO> getRelationshipsForGraph(int userId) {
        User user = repository.findById(userId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "User not found with id: " + userId));

        List<UserRelationship> allRels = relationshipRepository.findAll();

        Set<Integer> contactIds = new HashSet<>();
        contactIds.add(userId);

        for (UserRelationship rel : allRels) {
            if (rel.getFromUser().getId() == userId) {
                contactIds.add(rel.getToUser().getId());
            } else if (rel.getToUser().getId() == userId) {
                contactIds.add(rel.getFromUser().getId());
            }
        }

        return allRels.stream()
                .filter(rel -> contactIds.contains(rel.getFromUser().getId()) && contactIds.contains(rel.getToUser().getId()))
                .map(rel -> new at.jku.volunteer_app.contract.RelationshipDTO(
                        rel.getId(),
                        rel.getFromUser().getId(),
                        rel.getFromUser().getName(),
                        rel.getToUser().getId(),
                        rel.getToUser().getName(),
                        rel.getType(),
                        rel.getLikeScore()
                ))
                .toList();
    }
}
