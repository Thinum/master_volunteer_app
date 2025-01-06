package univ.iwa.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import univ.iwa.model._User;
import univ.iwa.repository._Member_Repository;
import univ.iwa.repository._Org_Admin_Repository;
import univ.iwa.repository._UserRepository;

@Service
public class _User_Service {
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
    private _Member_Repository memberRepository;
    //endregion

    //region Org_Admin
    @Autowired
    private _Org_Admin_Repository orgAdminRepository;
    //endregion

}
