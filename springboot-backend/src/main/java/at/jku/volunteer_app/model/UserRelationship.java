package at.jku.volunteer_app.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "user_relationship")
public class UserRelationship {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "from_user_id")
    private User fromUser;

    @ManyToOne
    @JoinColumn(name = "to_user_id")
    private User toUser;

    @Enumerated(EnumType.STRING)
    private RelationshipType type;

    @Column(name = "like_score")
    private Integer likeScore;

    public UserRelationship(Long id, User fromUser, User toUser, RelationshipType type) {
        this.id = id;
        this.fromUser = fromUser;
        this.toUser = toUser;
        this.type = type;
        this.likeScore = 80; // default fallback
    }

    public UserRelationship(Long id, User fromUser, User toUser, RelationshipType type, Integer likeScore) {
        this.id = id;
        this.fromUser = fromUser;
        this.toUser = toUser;
        this.type = type;
        this.likeScore = likeScore;
    }
}
