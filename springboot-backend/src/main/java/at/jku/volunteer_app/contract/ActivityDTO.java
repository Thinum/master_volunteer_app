package at.jku.volunteer_app.contract;

import at.jku.volunteer_app.model.ActivityStatus;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.sql.Timestamp;
import java.util.List;

public record ActivityDTO(
        int id,
        String title,
        String body,
        String description,
        int projectId,
        List<OrganisationDTO> organisations,
        List<AppointmentDTO> appointments,
        Timestamp date,
        String startTime,
        String endTime,
        String duration,
        Timestamp expiresAt,
        String location,
        CoordinatesDTO coordinates,
        List<UserDTO> participants,
        UserDTO createdBy,
        List<String> skills,
        List<ActivitySkillRequirementDTO> requiredSkills,
        List<ActivitySkillRequirementDTO> preferredSkills,
        List<InterestCategoryDTO> categories,
        List<String> qualifications,
        List<String> prerequisites,
        int capacity,
        int spotsTaken,
        List<String> equipmentProvided,
        List<String> tags,
        String difficulty,
        @JsonProperty("isPublic")
        boolean isPublic,
        ActivityStatus status,
        Timestamp createdAt,
        Timestamp updatedAt
) {
}
