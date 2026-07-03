package at.jku.volunteer_app.service;

import at.jku.volunteer_app.model.ChatConversation;
import at.jku.volunteer_app.repository.ChatConversationRepository;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class ChatConversationService {

    private final ChatConversationRepository chatConversationRepository;

    public ChatConversationService(ChatConversationRepository chatConversationRepository) {
        this.chatConversationRepository = chatConversationRepository;
    }

    public List<ChatConversation> getConversations() {
        return chatConversationRepository.findAllByOrderByTimestampDesc();
    }

    public List<ChatConversation> getConversationsForOwner(int ownerUserId) {
        return chatConversationRepository.findByOwnerUserIdOrderByTimestampDesc(ownerUserId);
    }

    public ChatConversation getConversationById(int id) {
        return chatConversationRepository.findById(id).orElse(null);
    }

    public ChatConversation createConversation(ChatConversation conversation) {
        if (conversation.getOwnerUserId() != null && conversation.getContactUserId() != null) {
            ChatConversation existingConversation = chatConversationRepository
                    .findByOwnerUserIdAndContactUserId(conversation.getOwnerUserId(), conversation.getContactUserId())
                    .orElse(null);
            if (existingConversation != null) {
                return existingConversation;
            }
        }
        if (conversation.getTimestamp() == null) {
            conversation.setTimestamp(new Timestamp(System.currentTimeMillis()));
        }
        if (conversation.getUnreadCount() == null) {
            conversation.setUnreadCount(0);
        }
        if (conversation.getActive() == null) {
            conversation.setActive(false);
        }
        return chatConversationRepository.save(conversation);
    }

    public ChatConversation updateConversation(ChatConversation conversation) {
        conversation.setTimestamp(new Timestamp(System.currentTimeMillis()));
        return chatConversationRepository.save(conversation);
    }

    public boolean deleteConversation(int id) {
        if (!chatConversationRepository.existsById(id)) {
            return false;
        }
        chatConversationRepository.deleteById(id);
        return true;
    }
}
