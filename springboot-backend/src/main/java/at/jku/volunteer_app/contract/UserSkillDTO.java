package at.jku.volunteer_app.contract;

import at.jku.volunteer_app.model.SkillProficiency;

public record UserSkillDTO(
        String name,
        String escoSkillUri,
        SkillProficiency proficiency
) {
}
