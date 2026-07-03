package at.jku.volunteer_app.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "chat_message")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private String author;

    private Integer authorUserId;

    private String authorName;

    private String avatar;

    private Boolean ownMessage;

    @Column(columnDefinition = "TEXT")
    private String text;

    private Timestamp createdAt;

    @ManyToOne
    @JoinColumn(name = "conversation_id")
    private ChatConversation conversation;
}
