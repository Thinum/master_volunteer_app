package at.jku.volunteer_app.model;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notification_payload")
public class NotificationPayload {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String payloadType;
    private String payload;
}
