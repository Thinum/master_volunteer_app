package univ.iwa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import univ.iwa.model._Org_Admin;

import java.util.Optional;

@Repository
public interface _Org_AdminRepository extends JpaRepository<_Org_Admin, Integer> {
    Optional<_Org_Admin> findById(int id);
}
