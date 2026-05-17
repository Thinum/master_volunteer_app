package at.jku.volunteer_app.service;

import at.jku.volunteer_app.model.RelationshipType;
import at.jku.volunteer_app.model.UserRelationship;
import at.jku.volunteer_app.repository.UserRelationshipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import at.jku.volunteer_app.model.User;
import at.jku.volunteer_app.model.UserModelDetails;
import at.jku.volunteer_app.repository.UserRepository;

import java.util.Optional;

@Service
public class UserService implements UserDetailsService {
    @Autowired
    UserRepository repository;
    @Autowired PasswordEncoder encoder;
    @Autowired
    UserRelationshipRepository relationshipRepository;
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> userDetail = repository.findByUsername(username);
        // Converting userDetail to UserDetails
        return userDetail.map(UserModelDetails::new)
                .orElse(null);
    }

    public String addUser(User user) {
        user.setPassword(encoder.encode(user.getPassword()));
        repository.save(user);
        return "User Added Successfully";
    }

    public boolean addFriend(int userId, int friendId) {
        if (userId == friendId) {
            throw new IllegalArgumentException("Cannot friend yourself");
        }

        User user = repository.findById(userId)
                .orElseThrow();

        User friend = repository.findById(friendId)
                .orElseThrow();


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
}