package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.model.Notification;
import at.jku.volunteer_app.model.UserModelDetails;
import at.jku.volunteer_app.service.NotificationService;
import at.jku.volunteer_app.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
    public List<Notification> getNotifications(@AuthenticationPrincipal UserModelDetails userDetails) {
        return notificationService.getNotificationsForUserId(userDetails.getUserId());
    }

    @PostMapping("/addNotification")
    public Notification createNotification(@RequestBody Notification notification,
                                           @AuthenticationPrincipal UserModelDetails userDetails) {
        return notificationService.addNotification(userDetails, notification);
    }

    @PostMapping("/read")
    public Notification readNotification(@RequestBody Notification notification,
                                         @AuthenticationPrincipal UserModelDetails userDetails) {
        return notificationService.readNotification(userDetails, notification);
    }
}
