package at.jku.volunteer_app.service;

import at.jku.volunteer_app.model.ForumEntry;
import at.jku.volunteer_app.repository.ForumEntryRepository;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class ForumEntryService {

    private final ForumEntryRepository forumEntryRepository;

    public ForumEntryService(ForumEntryRepository forumEntryRepository) {
        this.forumEntryRepository = forumEntryRepository;
    }

    public List<ForumEntry> getForumEntries() {
        return forumEntryRepository.findAllByOrderByLastEditedDesc();
    }

    public ForumEntry getForumEntryById(int id) {
        return forumEntryRepository.findById(id).orElse(null);
    }

    public ForumEntry createForumEntry(ForumEntry forumEntry) {
        if (forumEntry.getLastEdited() == null) {
            forumEntry.setLastEdited(new Timestamp(System.currentTimeMillis()));
        }
        return forumEntryRepository.save(forumEntry);
    }

    public ForumEntry updateForumEntry(ForumEntry forumEntry) {
        forumEntry.setLastEdited(new Timestamp(System.currentTimeMillis()));
        return forumEntryRepository.save(forumEntry);
    }

    public boolean deleteForumEntry(int id) {
        if (!forumEntryRepository.existsById(id)) {
            return false;
        }
        forumEntryRepository.deleteById(id);
        return true;
    }
}
