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
@Table(name = "organisation_members")
public class OrganisationMember {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "organisation_id")
    private Organisation organisation;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private int EngagementLevel;

    @Temporal(TemporalType.TIMESTAMP)
    private Timestamp joinedAt;
}
