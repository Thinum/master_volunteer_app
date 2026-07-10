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
public class ActivitySkillRequirement {

    @Column(name = "skills")
    private String name;

    @Column(name = "esco_skill_uri")
    private String escoSkillUri;

    @Enumerated(EnumType.STRING)
    @Column(name = "minimum_proficiency")
    private SkillProficiency minimumProficiency;

    @Column(name = "is_required")
    private Boolean required;

    public static ActivitySkillRequirement required(String name) {
        return new ActivitySkillRequirement(name, null, SkillProficiency.defaultActivityMinimum(), true);
    }

    public static ActivitySkillRequirement required(String name, SkillProficiency minimumProficiency) {
        return new ActivitySkillRequirement(name, null, minimumProficiency, true);
    }

    public static ActivitySkillRequirement preferred(String name) {
        return new ActivitySkillRequirement(name, null, SkillProficiency.defaultActivityMinimum(), false);
    }

    public static ActivitySkillRequirement preferred(String name, SkillProficiency minimumProficiency) {
        return new ActivitySkillRequirement(name, null, minimumProficiency, false);
    }

    public boolean isRequiredSkill() {
        return required == null || required;
    }

    public SkillProficiency getMinimumProficiencyOrDefault() {
        return minimumProficiency == null ? SkillProficiency.defaultActivityMinimum() : minimumProficiency;
    }
}
