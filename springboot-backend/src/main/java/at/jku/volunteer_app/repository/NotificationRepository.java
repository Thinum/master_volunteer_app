package at.jku.volunteer_app.repository;

import at.jku.volunteer_app.model.Notification;
import at.jku.volunteer_app.model.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    Optional<Notification> findById(int id);

    List<Notification> findByUser_Id(int user_id);

    List<Notification> findByUser_IdAndHasBeenReadFalse(int userId);

    boolean existsByUser_IdAndTypeAndHasBeenReadFalse(int userId, NotificationType type);
}
