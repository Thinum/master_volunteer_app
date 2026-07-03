package at.jku.volunteer_app.repository;

import at.jku.volunteer_app.model.ForumEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ForumEntryRepository extends JpaRepository<ForumEntry, Integer> {

    List<ForumEntry> findAllByOrderByLastEditedDesc();
}
