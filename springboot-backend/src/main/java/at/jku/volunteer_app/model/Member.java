package at.jku.volunteer_app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "member")
@Inheritance(strategy = InheritanceType.JOINED)
public class Member extends User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

}
