package at.jku.volunteer_app.contract;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.sql.Timestamp;
import java.util.List;

public record UserDTO(
        int id,
        String name,
        String email,
        String profilePicture,
        String phone,
        List<String> skills,
        List<UserSkillDTO> skillProfiles,
        List<String> interests,
        List<InterestCategoryDTO> interestCategories,
        @JsonProperty("isActive")
        boolean isActive,
        Timestamp joinedAt,
        String username,
        List<OrganisationDTO> organisations,
        List<ActivityDTO> activities
) {
}
