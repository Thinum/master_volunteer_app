package at.jku.volunteer_app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "appointment")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    private String title;
    private String description;
    private String location;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Timestamp startDateTime;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Timestamp endDateTime;
    
    private int createdBy;
    
    @ManyToOne
    @JoinColumn(name = "activity_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Activity activity;
}
