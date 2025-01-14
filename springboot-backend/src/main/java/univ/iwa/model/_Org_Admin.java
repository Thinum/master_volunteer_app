package univ.iwa.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "org_admin")
public class _Org_Admin extends _Member{
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

}
