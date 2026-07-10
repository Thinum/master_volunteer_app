package at.jku.volunteer_app.contract;

import at.jku.volunteer_app.model.SkillProficiency;

public record ActivitySkillRequirementDTO(
        String name,
        String escoSkillUri,
        SkillProficiency minimumProficiency,
        boolean required
) {
}
