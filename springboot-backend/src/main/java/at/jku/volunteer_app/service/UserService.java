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

import java.util.Optional;

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
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
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
                .orElseThrow(() -> new IllegalArgumentException("Friend not found with id: " + friendId));


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

    public java.util.List<User> getActiveUsers() {
        return repository.findAll().stream().filter(User::isActive).toList();
    }
}