package at.jku.volunteer_app.repository;

import at.jku.volunteer_app.model.SkillConcept;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SkillConceptRepository extends JpaRepository<SkillConcept, Integer> {

    @Override
    List<SkillConcept> findAll();

    Optional<SkillConcept> findByConceptUri(String conceptUri);

    Optional<SkillConcept> findByNormalizedLabel(String normalizedLabel);
}
