package at.jku.volunteer_app.contract;

import java.util.List;

public record OrganisationAdminAssignmentDTO(
        int organisationId,
        String organisationName,
        List<UserDTO> admins
) {
}
