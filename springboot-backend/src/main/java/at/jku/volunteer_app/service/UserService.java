package at.jku.volunteer_app.service;

import at.jku.volunteer_app.model.RelationshipType;
import at.jku.volunteer_app.model.UserRelationship;
import at.jku.volunteer_app.repository.UserRelationshipRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import at.jku.volunteer_app.model.User;
import at.jku.volunteer_app.model.UserModelDetails;
import at.jku.volunteer_app.repository.UserRepository;

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

    public java.util.List<User> getAllUsers() {
        return repository.findAll();
    }

    public User getUserById(int id) {
        return repository.findById(id).orElse(null);
    }

    public java.util.List<User> getFriends(int userId) {
        User user = repository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        return relationshipRepository.findAllByFromUserAndType(user, RelationshipType.FRIEND)
                .stream()
                .map(UserRelationship::getToUser)
                .toList();
    }

    public java.util.List<User> getActiveUsers() {
        return repository.findAll().stream().filter(User::isActive).toList();
    }

    public User getUserByUsername(String username) {
        return repository.findByUsername(username).orElse(null);
    }

    public java.util.List<at.jku.volunteer_app.contract.RelationshipDTO> getRelationshipsForGraph(int userId) {
        User user = repository.findById(userId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "User not found with id: " + userId));

        java.util.List<UserRelationship> allRels = relationshipRepository.findAll();

        java.util.Set<Integer> contactIds = new java.util.HashSet<>();
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