package univ.iwa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import univ.iwa.model._User;

import java.util.Optional;

@Repository
public interface _UserRepository extends JpaRepository<_User, Integer> {
    Optional<_User> findByName(String name);
}
