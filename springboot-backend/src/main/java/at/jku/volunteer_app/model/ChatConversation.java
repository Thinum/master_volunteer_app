package at.jku.volunteer_app.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "chat_conversation")
public class ChatConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private Integer ownerUserId;

    private Integer contactUserId;

    private String contact;

    private String avatar;

    @Column(columnDefinition = "TEXT")
    private String lastMessage;

    private Timestamp timestamp;

    private Integer unreadCount;

    private Boolean active;
}
