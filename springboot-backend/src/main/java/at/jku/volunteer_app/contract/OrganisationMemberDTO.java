package at.jku.volunteer_app.contract;

import java.sql.Timestamp;

public record OrganisationMemberDTO(
        Long id,
        UserDTO user,
        int engagementLevel,
        Timestamp joinedAt
) {
}
