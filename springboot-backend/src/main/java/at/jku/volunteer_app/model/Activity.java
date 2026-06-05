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
@Table(name = "activity")
public class Activity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String body;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "project_id")
    private int projectId;

    @ManyToMany
    @JoinTable(
        name = "activity_organisations",
        joinColumns = @JoinColumn(name = "activity_id"),
        inverseJoinColumns = @JoinColumn(name = "organisation_id")
    )
    private List<Organisation> organisations;

    @OneToMany(mappedBy = "activity", cascade = CascadeType.ALL)
    private List<Appointment> appointments;

    private Timestamp date;
    private String startTime;
    private String endTime;
    private String duration;
    private Timestamp expiresAt;

    private String location;
    private Coordinates coordinates;

    @ManyToMany
    @JoinTable(
        name = "activity_participants",
        joinColumns = @JoinColumn(name = "activity_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> participants;

    @ManyToOne
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @ElementCollection
    private List<String> skills;

    @ElementCollection
    private List<String> qualifications;

    @ElementCollection
    private List<String> prerequisites;

    private int capacity;
    private int spotsTaken;

    @ElementCollection
    private List<String> equipmentProvided;

    @ElementCollection
    private List<String> tags;

    private String difficulty;
    private boolean isPublic;
    private String status;

    private Timestamp createdAt;
    private Timestamp updatedAt;
}
