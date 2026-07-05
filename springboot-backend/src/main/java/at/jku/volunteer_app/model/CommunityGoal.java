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
@Table(name = "community_goal")
public class CommunityGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // z.B. 20 Aktivitäten
    private int targetValue;

    // optional:
    private int currentValue;

    @ManyToMany
    @JoinTable(
            name = "community_goal_activity_interests",
            joinColumns = @JoinColumn(name = "community_goal_id"),
            inverseJoinColumns = @JoinColumn(name = "interest_id")
    )
    private List<Interest> activityInterests;

    @Transient
    private List<String> activityTags;

    private Timestamp startDate;
    private Timestamp endDate;

    private String status; // z.B. "ACTIVE", "COMPLETED", "EXPIRED"

    private Timestamp createdAt;
    private Timestamp updatedAt;

    @ManyToOne
    @JoinColumn(name = "organisation_id")
    private Organisation organisation;
}
