package univ.iwa.model;

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
public class _Member extends _User{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

}
