package at.jku.volunteer_app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import at.jku.volunteer_app.model.Org_Admin;

import java.util.Optional;

@Repository
public interface Org_AdminRepository extends JpaRepository<Org_Admin, Integer> {
    Optional<Org_Admin> findById(int id);
}
