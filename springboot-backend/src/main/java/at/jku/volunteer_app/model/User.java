package at.jku.volunteer_app.model;

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
    private String password;
    private String profilePicture;

    @Temporal(TemporalType.TIMESTAMP)
    private Timestamp createdAt;

    private String username;


    @OneToMany(mappedBy = "fromUser",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<UserRelationship> relationshipsFrom;

    @OneToMany(mappedBy = "toUser",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<UserRelationship> relationshipsTo;
}
