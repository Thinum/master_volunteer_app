package at.jku.volunteer_app.service;

import at.jku.volunteer_app.model.Notification;
import at.jku.volunteer_app.model.NotificationPayload;
import at.jku.volunteer_app.model.NotificationType;
import at.jku.volunteer_app.model.UserModelDetails;
import at.jku.volunteer_app.repository.NotificationRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class NotificationService {
    private NotificationRepository notificationRepository = null;
    private UserService userService = null;

    public NotificationService(NotificationRepository notificationRepository, UserService userService) {
        this.notificationRepository = notificationRepository;
        this.userService = userService;
    }

    public List<Notification> getNotificationsForUserId(int userId)
    {
        return this.notificationRepository.findByUser_Id(userId);
    }

    public Notification addNotification(UserModelDetails currentUserModelDetails, Notification notification)
    {
        if(notification.getType() == NotificationType.FRIEND_REQUEST){
            NotificationPayload payload = new NotificationPayload();
            payload.setPayloadType("USER_ID");
            payload.setPayload(String.valueOf(currentUserModelDetails.getUserId()));
            notification.setNotificationPayloadList(List.of(payload));
        }
        return this.notificationRepository.save(notification);
    }

    public Notification readNotification(UserModelDetails currentUserModelDetails, Notification notification)
    {
        Notification notificationToRead = this.notificationRepository.getReferenceById(notification.getId());
        if (notification.getType() == NotificationType.FRIEND_REQUEST) {
            this.userService.addFriend(currentUserModelDetails.getUserId(),
                    Integer.parseInt(notification.getNotificationPayloadList().get(0).getPayload()));
        }
        notificationToRead.setHasBeenRead(true);
        return this.notificationRepository.save(notificationToRead);
    }
}
