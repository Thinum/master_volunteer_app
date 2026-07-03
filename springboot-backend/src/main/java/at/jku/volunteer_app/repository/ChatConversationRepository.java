package at.jku.volunteer_app.repository;

import at.jku.volunteer_app.model.ChatConversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatConversationRepository extends JpaRepository<ChatConversation, Integer> {

    List<ChatConversation> findAllByOrderByTimestampDesc();

    List<ChatConversation> findByOwnerUserIdOrderByTimestampDesc(int ownerUserId);

    Optional<ChatConversation> findByOwnerUserIdAndContactUserId(int ownerUserId, int contactUserId);
}
