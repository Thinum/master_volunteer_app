package at.jku.volunteer_app.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user")
@Inheritance(strategy = InheritanceType.JOINED)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    private String name;
    private String email;
    @JsonIgnore
    private String password;
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String profilePicture;
    private String phone;
    private boolean isActive = true;

    @ElementCollection
    @CollectionTable(name = "user_skills", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "skill")
    private List<String> skills;

    @ElementCollection
    @CollectionTable(name = "user_interests", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "interest")
    private List<String> interests;

    @Temporal(TemporalType.TIMESTAMP)
    private Timestamp joinedAt;

    private String username;


    @OneToMany(mappedBy = "fromUser",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    @JsonIgnore
    private List<UserRelationship> relationshipsFrom;

    @OneToMany(mappedBy = "toUser",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    @JsonIgnore
    private List<UserRelationship> relationshipsTo;

    @OneToMany(mappedBy = "user",
        cascade = CascadeType.ALL,
        orphanRemoval = true)
    @JsonIgnore
    private List<Notification> notifications;
}
