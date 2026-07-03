package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.contract.ContractMapper;
import at.jku.volunteer_app.contract.ForumEntryDTO;
import at.jku.volunteer_app.service.ForumEntryService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/forum-entries")
public class ForumEntryController {

    private final ForumEntryService forumEntryService;

    public ForumEntryController(ForumEntryService forumEntryService) {
        this.forumEntryService = forumEntryService;
    }

    @GetMapping
    public List<ForumEntryDTO> getForumEntries() {
        return forumEntryService.getForumEntries().stream()
                .map(ContractMapper::toForumEntryDTO)
                .toList();
    }

    @GetMapping("/{id}")
    public ForumEntryDTO getForumEntryById(@PathVariable int id) {
        return ContractMapper.toForumEntryDTO(forumEntryService.getForumEntryById(id));
    }

    @PostMapping
    public ForumEntryDTO createForumEntry(@RequestBody ForumEntryDTO forumEntry) {
        return ContractMapper.toForumEntryDTO(
                forumEntryService.createForumEntry(ContractMapper.toForumEntryEntity(forumEntry))
        );
    }

    @PutMapping("/{id}")
    public ForumEntryDTO updateForumEntry(@PathVariable int id,
                                          @RequestBody ForumEntryDTO forumEntry) {
        ForumEntryDTO forumEntryToUpdate = new ForumEntryDTO(
                id,
                forumEntry.title(),
                forumEntry.lastMessage(),
                forumEntry.lastEdited(),
                forumEntry.icon(),
                forumEntry.newPosts()
        );
        return ContractMapper.toForumEntryDTO(
                forumEntryService.updateForumEntry(ContractMapper.toForumEntryEntity(forumEntryToUpdate))
        );
    }

    @DeleteMapping("/{id}")
    public boolean deleteForumEntry(@PathVariable int id) {
        return forumEntryService.deleteForumEntry(id);
    }
}
