package at.jku.volunteer_app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "member")
@Inheritance(strategy = InheritanceType.JOINED)
public class Member extends User {

}
