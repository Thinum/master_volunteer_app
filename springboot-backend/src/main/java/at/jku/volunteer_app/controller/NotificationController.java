package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.contract.ContractMapper;
import at.jku.volunteer_app.contract.NotificationDTO;
import at.jku.volunteer_app.model.UserModelDetails;
import at.jku.volunteer_app.service.NotificationService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;



@RestController
@RequestMapping("/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/notifications")
    public List<NotificationDTO> getNotifications(@AuthenticationPrincipal UserModelDetails userDetails) {
        return ContractMapper.toNotificationDTOList(notificationService.getNotificationsForUserId(userDetails.getUserId()));
    }

    @PostMapping("/addNotification")
    public NotificationDTO createNotification(@RequestBody NotificationDTO notification,
                                              @AuthenticationPrincipal UserModelDetails userDetails) {
        return ContractMapper.toNotificationDTO(
                notificationService.addNotification(userDetails, ContractMapper.toNotificationEntity(notification))
        );
    }

    @PostMapping("/read")
    public NotificationDTO readNotification(@RequestBody NotificationDTO notification,
                                            @AuthenticationPrincipal UserModelDetails userDetails) {
        return ContractMapper.toNotificationDTO(
                notificationService.readNotification(userDetails, ContractMapper.toNotificationEntity(notification))
        );
    }

    @PostMapping("/{id}/accept")
    public NotificationDTO acceptFriendRequest(@PathVariable int id,
                                               @AuthenticationPrincipal UserModelDetails userDetails) {
        return ContractMapper.toNotificationDTO(
                notificationService.respondToFriendRequest(userDetails.getUserId(), id, true)
        );
    }

    @PostMapping("/{id}/reject")
    public NotificationDTO rejectFriendRequest(@PathVariable int id,
                                               @AuthenticationPrincipal UserModelDetails userDetails) {
        return ContractMapper.toNotificationDTO(
                notificationService.respondToFriendRequest(userDetails.getUserId(), id, false)
        );
    }
}
