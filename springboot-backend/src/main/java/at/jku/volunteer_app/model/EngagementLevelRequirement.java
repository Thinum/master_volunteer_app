package at.jku.volunteer_app.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "engagement_level_requirement",
        uniqueConstraints = @UniqueConstraint(columnNames = {"organisation_id", "engagement_level"})
)
public class EngagementLevelRequirement {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organisation_id", nullable = false)
    @JsonIgnore
    private Organisation organisation;

    @Column(name = "engagement_level", nullable = false)
    private int level;

    /** Null means that registrations are unlimited at this level. */
    private Integer registrationLimit;

    private int requiredActivities;

    private int timespanValue;

    @Enumerated(EnumType.STRING)
    private EngagementTimeUnit timespanUnit;
}
