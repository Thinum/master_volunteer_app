package at.jku.volunteer_app.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class UserSkill {

    @Column(name = "skill")
    private String name;

    @Column(name = "esco_skill_uri")
    private String escoSkillUri;

    @Enumerated(EnumType.STRING)
    @Column(name = "proficiency")
    private SkillProficiency proficiency;

    public static UserSkill fromName(String name) {
        return new UserSkill(name, null, SkillProficiency.defaultUserLevel());
    }

    public SkillProficiency getProficiencyOrDefault() {
        return proficiency == null ? SkillProficiency.defaultUserLevel() : proficiency;
    }
}
