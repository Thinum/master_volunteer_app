package at.jku.volunteer_app.repository;

import at.jku.volunteer_app.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Integer> {

    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(int conversationId);
}
