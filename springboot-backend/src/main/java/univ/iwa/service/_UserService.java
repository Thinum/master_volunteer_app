package univ.iwa.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import univ.iwa.model._User;
import univ.iwa.repository._MemberRepository;
import univ.iwa.repository._Org_AdminRepository;
import univ.iwa.repository._UserRepository;

@Service
public class _UserService {
    @Autowired
    PasswordEncoder encoder;
    //region User
    @Autowired
    private _UserRepository userRepository;

    public String addUser(_User user){
        user.setPassword(encoder.encode(user.getPassword()));
        userRepository.save(user);
        return String.format("User %s added successfully", user.getName());
    }
    //endregion

    //region Member
    @Autowired
    private _MemberRepository memberRepository;
    //endregion

    //region Org_Admin
    @Autowired
    private _Org_AdminRepository orgAdminRepository;
    //endregion

}
