package at.jku.volunteer_app.service;

import at.jku.volunteer_app.model.ForumEntry;
import at.jku.volunteer_app.model.ForumReply;
import at.jku.volunteer_app.repository.ForumEntryRepository;
import at.jku.volunteer_app.repository.ForumReplyRepository;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class ForumReplyService {

    private final ForumReplyRepository forumReplyRepository;
    private final ForumEntryRepository forumEntryRepository;

    public ForumReplyService(ForumReplyRepository forumReplyRepository,
                             ForumEntryRepository forumEntryRepository) {
        this.forumReplyRepository = forumReplyRepository;
        this.forumEntryRepository = forumEntryRepository;
    }

    public List<ForumReply> getReplies(int forumEntryId) {
        return forumReplyRepository.findByForumEntryIdOrderByCreatedAtAsc(forumEntryId);
    }

    public ForumReply createReply(int forumEntryId, ForumReply reply) {
        ForumEntry forumEntry = forumEntryRepository.findById(forumEntryId).orElse(null);
        if (forumEntry == null) {
            return null;
        }

        if (reply.getCreatedAt() == null) {
            reply.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        }
        if (reply.getAuthor() == null || reply.getAuthor().isBlank()) {
            reply.setAuthor("You");
        }
        if (reply.getAvatar() == null || reply.getAvatar().isBlank()) {
            reply.setAvatar("https://api.dicebear.com/9.x/lorelei/svg/seed=current-user");
        }
        reply.setForumEntry(forumEntry);

        ForumReply savedReply = forumReplyRepository.save(reply);
        forumEntry.setLastMessage(savedReply.getMessage());
        forumEntry.setLastEdited(savedReply.getCreatedAt());
        forumEntry.setNewPosts((forumEntry.getNewPosts() == null ? 0 : forumEntry.getNewPosts()) + 1);
        forumEntryRepository.save(forumEntry);
        return savedReply;
    }
}
