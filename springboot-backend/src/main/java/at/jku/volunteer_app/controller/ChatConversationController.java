package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.contract.ChatConversationDTO;
import at.jku.volunteer_app.contract.ContractMapper;
import at.jku.volunteer_app.service.ChatConversationService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/chat-conversations")
public class ChatConversationController {

    private final ChatConversationService chatConversationService;

    public ChatConversationController(ChatConversationService chatConversationService) {
        this.chatConversationService = chatConversationService;
    }

    @GetMapping
    public List<ChatConversationDTO> getConversations(@RequestParam(value = "ownerUserId", required = false) Integer ownerUserId) {
        return (ownerUserId == null
                ? chatConversationService.getConversations()
                : chatConversationService.getConversationsForOwner(ownerUserId)).stream()
                .map(ContractMapper::toChatConversationDTO)
                .toList();
    }

    @GetMapping("/{id}")
    public ChatConversationDTO getConversationById(@PathVariable int id) {
        return ContractMapper.toChatConversationDTO(chatConversationService.getConversationById(id));
    }

    @PostMapping
    public ChatConversationDTO createConversation(@RequestBody ChatConversationDTO conversation) {
        return ContractMapper.toChatConversationDTO(
                chatConversationService.createConversation(ContractMapper.toChatConversationEntity(conversation))
        );
    }

    @PutMapping("/{id}")
    public ChatConversationDTO updateConversation(@PathVariable int id,
                                                  @RequestBody ChatConversationDTO conversation) {
        ChatConversationDTO conversationToUpdate = new ChatConversationDTO(
                id,
                conversation.ownerUserId(),
                conversation.contactUserId(),
                conversation.contact(),
                conversation.avatar(),
                conversation.lastMessage(),
                conversation.timestamp(),
                conversation.unreadCount(),
                conversation.isActive()
        );
        return ContractMapper.toChatConversationDTO(
                chatConversationService.updateConversation(ContractMapper.toChatConversationEntity(conversationToUpdate))
        );
    }

    @DeleteMapping("/{id}")
    public boolean deleteConversation(@PathVariable int id) {
        return chatConversationService.deleteConversation(id);
    }
}
