package at.jku.volunteer_app.repository;

import at.jku.volunteer_app.model.ForumReply;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ForumReplyRepository extends JpaRepository<ForumReply, Integer> {

    List<ForumReply> findByForumEntryIdOrderByCreatedAtAsc(int forumEntryId);
}
