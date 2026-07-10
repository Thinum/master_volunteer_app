package at.jku.volunteer_app.service;

import at.jku.volunteer_app.model.Notification;
import at.jku.volunteer_app.model.NotificationPayload;
import at.jku.volunteer_app.model.NotificationType;
import at.jku.volunteer_app.model.UserModelDetails;
import at.jku.volunteer_app.repository.NotificationRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

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
        return this.notificationRepository.findByUser_IdAndHasBeenReadFalse(userId);
    }

    public Notification addNotification(UserModelDetails currentUserModelDetails, Notification notification)
    {
        if(notification.getType() == NotificationType.FRIEND_REQUEST){
            var sender = this.userService.getUserById(currentUserModelDetails.getUserId());
            NotificationPayload payload = new NotificationPayload();
            payload.setPayloadType("USER_ID");
            payload.setPayload(String.valueOf(currentUserModelDetails.getUserId()));
            notification.setNotificationPayloadList(List.of(payload));
            notification.setTitle("Friend request");
            notification.setText(sender.getName() + " wants to connect with you.");
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

    @Transactional
    public Notification respondToFriendRequest(int userId, int notificationId, boolean accept) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        if (notification.getUser() == null || notification.getUser().getId() != userId) {
            throw new IllegalArgumentException("Notification does not belong to the current user");
        }
        if (notification.getType() != NotificationType.FRIEND_REQUEST || notification.isHasBeenRead()) {
            throw new IllegalArgumentException("Friend request is no longer open");
        }

        if (accept) {
            int senderId = notification.getNotificationPayloadList().stream()
                    .filter(payload -> "USER_ID".equals(payload.getPayloadType()))
                    .findFirst()
                    .map(payload -> Integer.parseInt(payload.getPayload()))
                    .orElseThrow(() -> new IllegalArgumentException("Friend request sender is missing"));
            userService.addFriend(userId, senderId);
        }

        notification.setHasBeenRead(true);
        return notificationRepository.save(notification);
    }
}
