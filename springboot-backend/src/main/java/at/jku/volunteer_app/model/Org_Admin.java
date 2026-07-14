package at.jku.volunteer_app.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "org_admin")
public class Org_Admin extends Member {

    private boolean platformAdmin;
}
