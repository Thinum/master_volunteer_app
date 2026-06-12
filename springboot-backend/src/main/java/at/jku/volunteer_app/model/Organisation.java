package at.jku.volunteer_app.model;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
@Table(name = "organisation")
public class Organisation {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    private String orgName;
    private Location location;
    @Column(name = "profilepicture")
    private String profilePicture;
    @Temporal(TemporalType.TIMESTAMP)
    private Timestamp createdAt;
    private String body;
    private boolean deactivated;
    @Temporal(TemporalType.TIMESTAMP)
    private Timestamp reactivationTime;

    @Enumerated(EnumType.STRING)
    private OrganisationCategory category;

    @ElementCollection
    private java.util.Set<String> tags;

    @ManyToMany
    @JoinTable(
        name = "organisation_contacts",
        joinColumns = @JoinColumn(name = "organisation_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private java.util.Set<User> orgContacts;

    @OneToMany(mappedBy = "organisation", cascade = CascadeType.ALL, orphanRemoval = true)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private java.util.Set<OrganisationMember> orgMembers;
}
