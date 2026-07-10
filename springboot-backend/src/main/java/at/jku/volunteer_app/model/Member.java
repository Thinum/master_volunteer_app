package at.jku.volunteer_app.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "member")
@Inheritance(strategy = InheritanceType.JOINED)
public class Member extends User {

}
