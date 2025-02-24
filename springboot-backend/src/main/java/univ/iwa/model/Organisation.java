package univ.iwa.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.geo.Point;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "organisation")
public class Organisation {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    private String orgName;
    private Point point;
    private String profilepicture;
    @Temporal(TemporalType.TIMESTAMP)
    private Timestamp created_at;
    private String body;
    private boolean deactivated;
    @Temporal(TemporalType.TIMESTAMP)
    private Timestamp reactivationTime;
}
