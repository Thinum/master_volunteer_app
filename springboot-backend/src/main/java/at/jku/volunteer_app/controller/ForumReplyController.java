package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.contract.ContractMapper;
import at.jku.volunteer_app.contract.ForumReplyDTO;
import at.jku.volunteer_app.service.ForumReplyService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/forum-entries/{forumEntryId}/replies")
public class ForumReplyController {

    private final ForumReplyService forumReplyService;

    public ForumReplyController(ForumReplyService forumReplyService) {
        this.forumReplyService = forumReplyService;
    }

    @GetMapping
    public List<ForumReplyDTO> getReplies(@PathVariable int forumEntryId) {
        return forumReplyService.getReplies(forumEntryId).stream()
                .map(ContractMapper::toForumReplyDTO)
                .toList();
    }

    @PostMapping
    public ForumReplyDTO createReply(@PathVariable int forumEntryId,
                                     @RequestBody ForumReplyDTO reply) {
        return ContractMapper.toForumReplyDTO(
                forumReplyService.createReply(forumEntryId, ContractMapper.toForumReplyEntity(reply))
        );
    }
}
