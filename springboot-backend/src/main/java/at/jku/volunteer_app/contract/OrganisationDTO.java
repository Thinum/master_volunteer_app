package at.jku.volunteer_app.contract;

import at.jku.volunteer_app.model.OrganisationCategory;

import java.sql.Timestamp;
import java.util.Set;

public record OrganisationDTO(
        int id,
        String orgName,
        LocationDTO location,
        String profilePicture,
        Timestamp createdAt,
        String body,
        boolean deactivated,
        Timestamp reactivationTime,
        OrganisationCategory category,
        Set<String> tags,
        Set<UserDTO> orgContacts,
        Set<OrganisationMemberDTO> orgMembers
) {
}
