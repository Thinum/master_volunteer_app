package at.jku.volunteer_app.service;

import at.jku.volunteer_app.model.ChatConversation;
import at.jku.volunteer_app.model.ChatMessage;
import at.jku.volunteer_app.model.User;
import at.jku.volunteer_app.repository.ChatConversationRepository;
import at.jku.volunteer_app.repository.ChatMessageRepository;
import at.jku.volunteer_app.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatConversationRepository chatConversationRepository;
    private final UserRepository userRepository;

    public ChatMessageService(ChatMessageRepository chatMessageRepository,
                              ChatConversationRepository chatConversationRepository,
                              UserRepository userRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.chatConversationRepository = chatConversationRepository;
        this.userRepository = userRepository;
    }

    public List<ChatMessage> getMessages(int conversationId) {
        return chatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    public ChatMessage createMessage(int conversationId, ChatMessage message) {
        ChatConversation conversation = chatConversationRepository.findById(conversationId).orElse(null);
        if (conversation == null) {
            return null;
        }

        Timestamp now = new Timestamp(System.currentTimeMillis());
        if (message.getCreatedAt() == null) {
            message.setCreatedAt(now);
        }
        if (message.getAuthor() == null || message.getAuthor().isBlank()) {
            message.setAuthor("me");
        }
        if (message.getAuthorUserId() == null) {
            message.setAuthorUserId(conversation.getOwnerUserId());
        }
        if (message.getAuthorName() == null || message.getAuthorName().isBlank()) {
            message.setAuthorName("Volunteer");
        }
        if (message.getAvatar() == null || message.getAvatar().isBlank()) {
            message.setAvatar("https://api.dicebear.com/9.x/lorelei/svg/seed=current-user");
        }
        if (message.getOwnMessage() == null) {
            message.setOwnMessage(true);
        }
        message.setConversation(conversation);

        ChatMessage savedMessage = chatMessageRepository.save(message);
        conversation.setLastMessage(savedMessage.getText());
        conversation.setTimestamp(savedMessage.getCreatedAt());
        conversation.setUnreadCount(0);
        chatConversationRepository.save(conversation);
        mirrorMessageToRecipientConversation(conversation, savedMessage);
        return savedMessage;
    }

    private void mirrorMessageToRecipientConversation(ChatConversation senderConversation, ChatMessage savedMessage) {
        Integer senderUserId = senderConversation.getOwnerUserId();
        Integer recipientUserId = senderConversation.getContactUserId();
        if (senderUserId == null || recipientUserId == null || senderUserId.equals(recipientUserId)) {
            return;
        }

        ChatConversation recipientConversation = chatConversationRepository
                .findByOwnerUserIdAndContactUserId(recipientUserId, senderUserId)
                .orElseGet(() -> createRecipientConversation(senderConversation, senderUserId, recipientUserId));

        ChatMessage mirroredMessage = new ChatMessage();
        mirroredMessage.setAuthor(savedMessage.getAuthor());
        mirroredMessage.setAuthorUserId(savedMessage.getAuthorUserId());
        mirroredMessage.setAuthorName(savedMessage.getAuthorName());
        mirroredMessage.setAvatar(savedMessage.getAvatar());
        mirroredMessage.setOwnMessage(false);
        mirroredMessage.setText(savedMessage.getText());
        mirroredMessage.setCreatedAt(savedMessage.getCreatedAt());
        mirroredMessage.setConversation(recipientConversation);
        chatMessageRepository.save(mirroredMessage);

        recipientConversation.setLastMessage(savedMessage.getText());
        recipientConversation.setTimestamp(savedMessage.getCreatedAt());
        recipientConversation.setUnreadCount((recipientConversation.getUnreadCount() == null ? 0 : recipientConversation.getUnreadCount()) + 1);
        chatConversationRepository.save(recipientConversation);
    }

    private ChatConversation createRecipientConversation(ChatConversation senderConversation, int senderUserId, int recipientUserId) {
        User sender = userRepository.findById(senderUserId).orElse(null);
        ChatConversation recipientConversation = new ChatConversation();
        recipientConversation.setOwnerUserId(recipientUserId);
        recipientConversation.setContactUserId(senderUserId);
        recipientConversation.setContact(sender == null ? senderConversation.getContact() : displayName(sender));
        recipientConversation.setAvatar(sender == null ? null : sender.getProfilePicture());
        recipientConversation.setLastMessage(senderConversation.getLastMessage());
        recipientConversation.setTimestamp(senderConversation.getTimestamp());
        recipientConversation.setUnreadCount(0);
        recipientConversation.setActive(sender == null || sender.isActive());
        return chatConversationRepository.save(recipientConversation);
    }

    private String displayName(User user) {
        if (user.getName() != null && !user.getName().isBlank()) {
            return user.getName();
        }
        if (user.getUsername() != null && !user.getUsername().isBlank()) {
            return user.getUsername();
        }
        return "Volunteer";
    }
}
