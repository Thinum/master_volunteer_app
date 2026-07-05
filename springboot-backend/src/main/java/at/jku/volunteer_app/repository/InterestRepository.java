package at.jku.volunteer_app.repository;

import at.jku.volunteer_app.model.Interest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterestRepository extends JpaRepository<Interest, Integer> {

    Optional<Interest> findByName(String name);
}
