package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.contract.ChatMessageDTO;
import at.jku.volunteer_app.contract.ContractMapper;
import at.jku.volunteer_app.service.ChatMessageService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/chat-conversations/{conversationId}/messages")
public class ChatMessageController {

    private final ChatMessageService chatMessageService;

    public ChatMessageController(ChatMessageService chatMessageService) {
        this.chatMessageService = chatMessageService;
    }

    @GetMapping
    public List<ChatMessageDTO> getMessages(@PathVariable int conversationId) {
        return chatMessageService.getMessages(conversationId).stream()
                .map(ContractMapper::toChatMessageDTO)
                .toList();
    }

    @PostMapping
    public ChatMessageDTO createMessage(@PathVariable int conversationId,
                                        @RequestBody ChatMessageDTO message) {
        return ContractMapper.toChatMessageDTO(
                chatMessageService.createMessage(conversationId, ContractMapper.toChatMessageEntity(message))
        );
    }
}
