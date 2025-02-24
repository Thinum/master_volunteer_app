package univ.iwa.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import univ.iwa.model.User;
import univ.iwa.repository.MemberRepository;
import univ.iwa.repository.Org_AdminRepository;
import univ.iwa.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    PasswordEncoder encoder;
    //region User
    @Autowired
    private UserRepository userRepository;

    public String addUser(User user){
        user.setPassword(encoder.encode(user.getPassword()));
        userRepository.save(user);
        return String.format("User %s added successfully", user.getName());
    }
    //endregion

    //region Member
    @Autowired
    private MemberRepository memberRepository;
    //endregion

    //region Org_Admin
    @Autowired
    private Org_AdminRepository orgAdminRepository;
    //endregion

}
