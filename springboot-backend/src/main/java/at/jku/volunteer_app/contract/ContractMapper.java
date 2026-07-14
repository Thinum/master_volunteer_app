package at.jku.volunteer_app.contract;

import at.jku.volunteer_app.model.Activity;
import at.jku.volunteer_app.model.ActivitySkillRequirement;
import at.jku.volunteer_app.model.Appointment;
import at.jku.volunteer_app.model.ChatConversation;
import at.jku.volunteer_app.model.ChatMessage;
import at.jku.volunteer_app.model.CommunityGoal;
import at.jku.volunteer_app.model.Coordinates;
import at.jku.volunteer_app.model.ForumEntry;
import at.jku.volunteer_app.model.ForumReply;
import at.jku.volunteer_app.model.Interest;
import at.jku.volunteer_app.model.InterestCategory;
import at.jku.volunteer_app.model.Location;
import at.jku.volunteer_app.model.Notification;
import at.jku.volunteer_app.model.NotificationPayload;
import at.jku.volunteer_app.model.Organisation;
import at.jku.volunteer_app.model.OrganisationMember;
import at.jku.volunteer_app.model.SkillProficiency;
import at.jku.volunteer_app.model.User;
import at.jku.volunteer_app.model.UserSkill;

import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

public final class ContractMapper {

    private ContractMapper() {
    }

    public static UserDTO toUserDTO(User user) {
        if (user == null) {
            return null;
        }
        return new UserDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getProfilePicture(),
                user.getPhone(),
                toUserSkillNameList(user.getSkillProfiles()),
                toUserSkillDTOList(user.getSkillProfiles()),
                toInterestLabelList(user.getInterestCategories()),
                toInterestCategoryDTOList(user.getInterestCategories()),
                user.isActive(),
                user.getJoinedAt(),
                user.getUsername(),
                null,
                null
        );
    }

    public static User toUserEntity(UserDTO dto) {
        if (dto == null) {
            return null;
        }
        User user = new User();
        user.setId(dto.id());
        user.setName(dto.name());
        user.setEmail(dto.email());
        user.setProfilePicture(dto.profilePicture());
        user.setPhone(dto.phone());
        user.setSkillProfiles(toUserSkillEntityList(dto.skillProfiles(), dto.skills()));
        user.setInterestCategories(toInterestCategoryEntityList(dto.interestCategories(), dto.interests()));
        user.setActive(dto.isActive());
        user.setJoinedAt(dto.joinedAt());
        user.setUsername(dto.username());
        return user;
    }

    public static List<UserDTO> toUserDTOList(List<User> users) {
        return users == null ? List.of() : users.stream().map(ContractMapper::toUserDTO).toList();
    }

    public static ActivityDTO toActivityDTO(Activity activity) {
        if (activity == null) {
            return null;
        }
        return new ActivityDTO(
                activity.getId(),
                activity.getTitle(),
                activity.getBody(),
                activity.getDescription(),
                activity.getProjectId(),
                toOrganisationDTOList(activity.getOrganisations()),
                toAppointmentDTOList(activity.getAppointments()),
                activity.getDate(),
                activity.getStartTime(),
                activity.getEndTime(),
                activity.getDuration(),
                activity.getExpiresAt(),
                activity.getLocation(),
                toCoordinatesDTO(activity.getCoordinates()),
                toUserDTOList(activity.getParticipants()),
                toUserDTO(activity.getCreatedBy()),
                safeList(activity.getSkills()),
                toActivitySkillRequirementDTOList(activity.getRequiredSkills()),
                toActivitySkillRequirementDTOList(activity.getPreferredSkills()),
                toInterestCategoryDTOList(activity.getCategories()),
                cleanStringList(activity.getQualifications()),
                cleanStringList(activity.getPrerequisites()),
                activity.getCapacity(),
                activity.getSpotsTaken(),
                cleanStringList(activity.getEquipmentProvided()),
                cleanStringList(activity.getTags()),
                activity.getDifficulty(),
                activity.isPublic(),
                activity.getStatus(),
                activity.getCreatedAt(),
                activity.getUpdatedAt()
        );
    }

    public static Activity toActivityEntity(ActivityDTO dto) {
        if (dto == null) {
            return null;
        }
        Activity activity = new Activity();
        activity.setId(dto.id());
        activity.setTitle(dto.title());
        activity.setBody(dto.body());
        activity.setDescription(dto.description());
        activity.setProjectId(dto.projectId());
        activity.setOrganisations(toOrganisationEntityList(dto.organisations()));
        activity.setAppointments(toAppointmentEntityList(dto.appointments(), activity));
        activity.setDate(dto.date());
        activity.setStartTime(dto.startTime());
        activity.setEndTime(dto.endTime());
        activity.setDuration(dto.duration());
        activity.setExpiresAt(dto.expiresAt());
        activity.setLocation(dto.location());
        activity.setCoordinates(toCoordinatesEntity(dto.coordinates()));
        activity.setParticipants(toUserEntityList(dto.participants()));
        activity.setCreatedBy(toUserEntity(dto.createdBy()));
        activity.setSkillRequirements(toActivitySkillRequirementEntityList(
                dto.requiredSkills(),
                dto.preferredSkills(),
                dto.skills()
        ));
        activity.setCategories(toInterestCategoryEntityList(dto.categories(), dto.tags()));
        activity.setQualifications(cleanStringList(dto.qualifications()));
        activity.setPrerequisites(cleanStringList(dto.prerequisites()));
        activity.setCapacity(dto.capacity());
        activity.setSpotsTaken(dto.spotsTaken());
        activity.setEquipmentProvided(cleanStringList(dto.equipmentProvided()));
        activity.setTags(cleanStringList(dto.tags()));
        activity.setDifficulty(dto.difficulty());
        activity.setPublic(dto.isPublic());
        activity.setStatus(dto.status());
        activity.setCreatedAt(dto.createdAt());
        activity.setUpdatedAt(dto.updatedAt());
        return activity;
    }

    public static List<ActivityDTO> toActivityDTOList(List<Activity> activities) {
        return activities == null ? List.of() : activities.stream().map(ContractMapper::toActivityDTO).toList();
    }

    public static OrganisationDTO toOrganisationDTO(Organisation organisation) {
        if (organisation == null) {
            return null;
        }
        return new OrganisationDTO(
                organisation.getId(),
                organisation.getOrgName(),
                toLocationDTO(organisation.getLocation()),
                organisation.getProfilePicture(),
                organisation.getCreatedAt(),
                organisation.getBody(),
                organisation.isDeactivated(),
                organisation.getReactivationTime(),
                organisation.getCategory(),
                cleanStringSet(organisation.getTags()),
                toUserDTOSet(organisation.getOrgContacts()),
                toOrganisationMemberDTOSet(organisation.getOrgMembers()),
                toUserDTOSet(new java.util.LinkedHashSet<>(organisation.getOrgAdmins()))
        );
    }

    public static Organisation toOrganisationEntity(OrganisationDTO dto) {
        if (dto == null) {
            return null;
        }
        Organisation organisation = new Organisation();
        organisation.setId(dto.id());
        organisation.setOrgName(dto.orgName());
        organisation.setLocation(toLocationEntity(dto.location()));
        organisation.setProfilePicture(dto.profilePicture());
        organisation.setCreatedAt(dto.createdAt());
        organisation.setBody(dto.body());
        organisation.setDeactivated(dto.deactivated());
        organisation.setReactivationTime(dto.reactivationTime());
        organisation.setCategory(dto.category());
        organisation.setTags(cleanStringSet(dto.tags()));
        organisation.setOrgContacts(toUserEntitySet(dto.orgContacts()));
        organisation.setOrgMembers(toOrganisationMemberEntitySet(dto.orgMembers(), organisation));
        return organisation;
    }

    public static List<OrganisationDTO> toOrganisationDTOList(List<Organisation> organisations) {
        return organisations == null ? List.of() : organisations.stream().map(ContractMapper::toOrganisationDTO).toList();
    }

    public static CommunityGoalDTO toCommunityGoalDTO(CommunityGoal goal) {
        if (goal == null) {
            return null;
        }
        return new CommunityGoalDTO(
                goal.getId(),
                goal.getTitle(),
                goal.getDescription(),
                goal.getTargetValue(),
                goal.getCurrentValue(),
                toInterestNameList(goal.getActivityInterests()),
                List.of(),
                goal.getStartDate(),
                goal.getEndDate(),
                goal.getStatus(),
                goal.getCreatedAt(),
                goal.getUpdatedAt(),
                toOrganisationDTO(goal.getOrganisation())
        );
    }

    public static CommunityGoal toCommunityGoalEntity(CommunityGoalDTO dto) {
        if (dto == null) {
            return null;
        }
        CommunityGoal goal = new CommunityGoal();
        goal.setId(dto.id());
        goal.setTitle(dto.title());
        goal.setDescription(dto.description());
        goal.setTargetValue(dto.targetValue());
        goal.setCurrentValue(dto.currentValue());
        goal.setActivityTags(safeList(dto.activityTags()));
        goal.setStartDate(dto.startDate());
        goal.setEndDate(dto.endDate());
        goal.setStatus(dto.status());
        goal.setCreatedAt(dto.createdAt());
        goal.setUpdatedAt(dto.updatedAt());
        goal.setOrganisation(toOrganisationEntity(dto.organisation()));
        return goal;
    }

    public static ForumEntryDTO toForumEntryDTO(ForumEntry forumEntry) {
        if (forumEntry == null) {
            return null;
        }
        return new ForumEntryDTO(
                forumEntry.getId(),
                forumEntry.getTitle(),
                forumEntry.getLastMessage(),
                forumEntry.getLastEdited(),
                forumEntry.getIcon(),
                forumEntry.getNewPosts()
        );
    }

    public static ForumEntry toForumEntryEntity(ForumEntryDTO dto) {
        if (dto == null) {
            return null;
        }
        ForumEntry forumEntry = new ForumEntry();
        forumEntry.setId(dto.id());
        forumEntry.setTitle(dto.title());
        forumEntry.setLastMessage(dto.lastMessage());
        forumEntry.setLastEdited(dto.lastEdited());
        forumEntry.setIcon(dto.icon());
        forumEntry.setNewPosts(dto.newPosts());
        return forumEntry;
    }

    public static ChatConversationDTO toChatConversationDTO(ChatConversation conversation) {
        if (conversation == null) {
            return null;
        }
        return new ChatConversationDTO(
                conversation.getId(),
                conversation.getOwnerUserId(),
                conversation.getContactUserId(),
                conversation.getContact(),
                conversation.getAvatar(),
                conversation.getLastMessage(),
                conversation.getTimestamp(),
                conversation.getUnreadCount(),
                conversation.getActive()
        );
    }

    public static ChatConversation toChatConversationEntity(ChatConversationDTO dto) {
        if (dto == null) {
            return null;
        }
        ChatConversation conversation = new ChatConversation();
        conversation.setId(dto.id());
        conversation.setOwnerUserId(dto.ownerUserId());
        conversation.setContactUserId(dto.contactUserId());
        conversation.setContact(dto.contact());
        conversation.setAvatar(dto.avatar());
        conversation.setLastMessage(dto.lastMessage());
        conversation.setTimestamp(dto.timestamp());
        conversation.setUnreadCount(dto.unreadCount());
        conversation.setActive(dto.isActive());
        return conversation;
    }

    public static ChatMessageDTO toChatMessageDTO(ChatMessage message) {
        if (message == null) {
            return null;
        }
        Integer conversationId = message.getConversation() == null ? null : message.getConversation().getId();
        return new ChatMessageDTO(
                message.getId(),
                message.getAuthor(),
                message.getAuthorUserId(),
                message.getAuthorName(),
                message.getAvatar(),
                message.getOwnMessage(),
                message.getText(),
                message.getCreatedAt(),
                conversationId
        );
    }

    public static ChatMessage toChatMessageEntity(ChatMessageDTO dto) {
        if (dto == null) {
            return null;
        }
        ChatMessage message = new ChatMessage();
        message.setId(dto.id());
        message.setAuthor(dto.author());
        message.setAuthorUserId(dto.authorUserId());
        message.setAuthorName(dto.authorName());
        message.setAvatar(dto.avatar());
        message.setOwnMessage(dto.ownMessage());
        message.setText(dto.text());
        message.setCreatedAt(dto.createdAt());
        return message;
    }

    public static ForumReplyDTO toForumReplyDTO(ForumReply reply) {
        if (reply == null) {
            return null;
        }
        Integer forumEntryId = reply.getForumEntry() == null ? null : reply.getForumEntry().getId();
        return new ForumReplyDTO(
                reply.getId(),
                reply.getAuthor(),
                reply.getAvatar(),
                reply.getMessage(),
                reply.getCreatedAt(),
                forumEntryId
        );
    }

    public static ForumReply toForumReplyEntity(ForumReplyDTO dto) {
        if (dto == null) {
            return null;
        }
        ForumReply reply = new ForumReply();
        reply.setId(dto.id());
        reply.setAuthor(dto.author());
        reply.setAvatar(dto.avatar());
        reply.setMessage(dto.message());
        reply.setCreatedAt(dto.createdAt());
        return reply;
    }

    public static NotificationDTO toNotificationDTO(Notification notification) {
        if (notification == null) {
            return null;
        }
        return new NotificationDTO(
                notification.getId(),
                notification.getTitle(),
                notification.getText(),
                notification.getType(),
                notification.isHasBeenRead(),
                notification.getCreatedAt(),
                toUserDTO(notification.getUser()),
                toNotificationPayloadDTOList(notification.getNotificationPayloadList())
        );
    }

    public static Notification toNotificationEntity(NotificationDTO dto) {
        if (dto == null) {
            return null;
        }
        Notification notification = new Notification();
        notification.setId(dto.id());
        notification.setTitle(dto.title());
        notification.setText(dto.text());
        notification.setType(dto.type());
        notification.setHasBeenRead(dto.hasBeenRead());
        notification.setCreatedAt(dto.createdAt());
        notification.setUser(toUserEntity(dto.user()));
        notification.setNotificationPayloadList(toNotificationPayloadEntityList(dto.notificationPayloadList()));
        return notification;
    }

    public static List<NotificationDTO> toNotificationDTOList(List<Notification> notifications) {
        return notifications == null ? List.of() : notifications.stream().map(ContractMapper::toNotificationDTO).toList();
    }

    public static AppointmentDTO toAppointmentDTO(Appointment appointment) {
        if (appointment == null) {
            return null;
        }
        Integer activityId = appointment.getActivity() == null ? null : appointment.getActivity().getId();
        return new AppointmentDTO(
                appointment.getId(),
                appointment.getTitle(),
                appointment.getDescription(),
                appointment.getLocation(),
                appointment.getStartDateTime(),
                appointment.getEndDateTime(),
                appointment.getCreatedBy(),
                activityId
        );
    }

    private static Appointment toAppointmentEntity(AppointmentDTO dto, Activity activity) {
        if (dto == null) {
            return null;
        }
        Appointment appointment = new Appointment();
        appointment.setId(dto.id());
        appointment.setTitle(dto.title());
        appointment.setDescription(dto.description());
        appointment.setLocation(dto.location());
        appointment.setStartDateTime(dto.startDateTime());
        appointment.setEndDateTime(dto.endDateTime());
        appointment.setCreatedBy(dto.createdBy());
        appointment.setActivity(activity);
        return appointment;
    }

    private static List<AppointmentDTO> toAppointmentDTOList(List<Appointment> appointments) {
        return appointments == null ? List.of() : appointments.stream().map(ContractMapper::toAppointmentDTO).toList();
    }

    private static CoordinatesDTO toCoordinatesDTO(Coordinates coordinates) {
        return coordinates == null ? null : new CoordinatesDTO(coordinates.getLat(), coordinates.getLng());
    }

    private static Coordinates toCoordinatesEntity(CoordinatesDTO dto) {
        return dto == null ? null : new Coordinates(dto.lat(), dto.lng());
    }

    private static LocationDTO toLocationDTO(Location location) {
        return location == null ? null : new LocationDTO(location.getLat(), location.getLon());
    }

    private static Location toLocationEntity(LocationDTO dto) {
        return dto == null ? null : new Location(dto.lat(), dto.lon());
    }

    private static Set<UserDTO> toUserDTOSet(Set<User> users) {
        return users == null ? Set.of() : users.stream().map(ContractMapper::toUserDTO).collect(Collectors.toSet());
    }

    private static List<User> toUserEntityList(List<UserDTO> users) {
        return users == null ? List.of() : users.stream().map(ContractMapper::toUserEntity).toList();
    }

    private static Set<User> toUserEntitySet(Set<UserDTO> users) {
        return users == null ? Set.of() : users.stream().map(ContractMapper::toUserEntity).collect(Collectors.toSet());
    }

    private static List<Activity> toActivityEntityList(List<ActivityDTO> activities) {
        return activities == null ? List.of() : activities.stream().map(ContractMapper::toActivityEntity).toList();
    }

    private static List<Organisation> toOrganisationEntityList(List<OrganisationDTO> organisations) {
        return organisations == null ? List.of() : organisations.stream().map(ContractMapper::toOrganisationEntity).toList();
    }

    private static List<Appointment> toAppointmentEntityList(List<AppointmentDTO> appointments, Activity activity) {
        return appointments == null ? List.of() : appointments.stream()
                .map(appointment -> toAppointmentEntity(appointment, activity))
                .toList();
    }

    private static Set<OrganisationMemberDTO> toOrganisationMemberDTOSet(Set<OrganisationMember> members) {
        return members == null ? Set.of() : members.stream()
                .map(member -> new OrganisationMemberDTO(
                        member.getId(),
                        toUserDTO(member.getUser()),
                        member.getEngagementLevel(),
                        member.getJoinedAt()
                ))
                .collect(Collectors.toSet());
    }

    private static Set<OrganisationMember> toOrganisationMemberEntitySet(Set<OrganisationMemberDTO> members, Organisation organisation) {
        return members == null ? Set.of() : members.stream()
                .map(dto -> {
                    OrganisationMember member = new OrganisationMember();
                    member.setId(dto.id());
                    member.setOrganisation(organisation);
                    member.setUser(toUserEntity(dto.user()));
                    member.setEngagementLevel(dto.engagementLevel());
                    member.setJoinedAt(dto.joinedAt());
                    return member;
                })
                .collect(Collectors.toSet());
    }

    private static List<NotificationPayloadDTO> toNotificationPayloadDTOList(List<NotificationPayload> payloads) {
        return payloads == null ? List.of() : payloads.stream()
                .map(payload -> new NotificationPayloadDTO(payload.getId(), payload.getPayloadType(), payload.getPayload()))
                .toList();
    }

    private static List<NotificationPayload> toNotificationPayloadEntityList(List<NotificationPayloadDTO> payloads) {
        return payloads == null ? List.of() : payloads.stream()
                .map(dto -> new NotificationPayload(dto.id(), dto.payloadType(), dto.payload()))
                .toList();
    }

    private static List<String> toUserSkillNameList(List<UserSkill> skills) {
        return safeList(skills).stream()
                .map(UserSkill::getName)
                .map(ContractMapper::cleanLabel)
                .filter(Objects::nonNull)
                .collect(Collectors.collectingAndThen(
                        Collectors.toMap(
                                ContractMapper::normalizedKey,
                                value -> value,
                                (existing, ignored) -> existing,
                                LinkedHashMap::new
                        ),
                        values -> new ArrayList<>(values.values())
                ))
                .stream()
                .toList();
    }

    private static List<UserSkillDTO> toUserSkillDTOList(List<UserSkill> skills) {
        return safeList(skills).stream()
                .filter(Objects::nonNull)
                .map(skill -> new UserSkillDTO(
                        cleanLabel(skill.getName()),
                        blankToNull(skill.getEscoSkillUri()),
                        skill.getProficiencyOrDefault()
                ))
                .filter(skill -> skill.name() != null)
                .collect(Collectors.collectingAndThen(
                        Collectors.toMap(
                                skill -> skillKey(skill.name(), skill.escoSkillUri()),
                                skill -> skill,
                                (existing, ignored) -> existing,
                                LinkedHashMap::new
                        ),
                        values -> new ArrayList<>(values.values())
                ))
                .stream()
                .toList();
    }

    private static List<UserSkill> toUserSkillEntityList(List<UserSkillDTO> skillProfiles, List<String> legacySkills) {
        Map<String, UserSkill> skillsByKey = new LinkedHashMap<>();

        safeList(skillProfiles).stream()
                .filter(Objects::nonNull)
                .map(dto -> new UserSkill(
                        cleanLabel(dto.name()),
                        blankToNull(dto.escoSkillUri()),
                        dto.proficiency() == null ? SkillProficiency.defaultUserLevel() : dto.proficiency()
                ))
                .filter(skill -> skill.getName() != null)
                .forEach(skill -> skillsByKey.put(skillKey(skill.getName(), skill.getEscoSkillUri()), skill));

        if (skillsByKey.isEmpty()) {
            safeList(legacySkills).stream()
                    .map(ContractMapper::cleanLabel)
                    .filter(Objects::nonNull)
                    .map(UserSkill::fromName)
                    .forEach(skill -> skillsByKey.put(skillKey(skill.getName(), skill.getEscoSkillUri()), skill));
        }

        return new ArrayList<>(skillsByKey.values());
    }

    private static List<ActivitySkillRequirementDTO> toActivitySkillRequirementDTOList(
            List<ActivitySkillRequirement> requirements
    ) {
        return safeList(requirements).stream()
                .filter(Objects::nonNull)
                .map(requirement -> new ActivitySkillRequirementDTO(
                        cleanLabel(requirement.getName()),
                        blankToNull(requirement.getEscoSkillUri()),
                        requirement.getMinimumProficiencyOrDefault(),
                        requirement.isRequiredSkill()
                ))
                .filter(requirement -> requirement.name() != null)
                .toList();
    }

    private static List<ActivitySkillRequirement> toActivitySkillRequirementEntityList(
            List<ActivitySkillRequirementDTO> requiredSkills,
            List<ActivitySkillRequirementDTO> preferredSkills,
            List<String> legacySkills
    ) {
        Map<String, ActivitySkillRequirement> requirementsByKey = new LinkedHashMap<>();

        safeList(requiredSkills).stream()
                .map(dto -> toActivitySkillRequirement(dto, true))
                .filter(Objects::nonNull)
                .forEach(requirement -> requirementsByKey.put(requirementKey(requirement), requirement));

        safeList(preferredSkills).stream()
                .map(dto -> toActivitySkillRequirement(dto, false))
                .filter(Objects::nonNull)
                .forEach(requirement -> requirementsByKey.put(requirementKey(requirement), requirement));

        if (requirementsByKey.isEmpty()) {
            safeList(legacySkills).stream()
                    .map(ContractMapper::cleanLabel)
                    .filter(Objects::nonNull)
                    .map(ActivitySkillRequirement::required)
                    .forEach(requirement -> requirementsByKey.put(requirementKey(requirement), requirement));
        }

        return new ArrayList<>(requirementsByKey.values());
    }

    private static ActivitySkillRequirement toActivitySkillRequirement(
            ActivitySkillRequirementDTO dto,
            boolean required
    ) {
        if (dto == null) {
            return null;
        }

        String name = cleanLabel(dto.name());
        if (name == null) {
            return null;
        }

        return new ActivitySkillRequirement(
                name,
                blankToNull(dto.escoSkillUri()),
                dto.minimumProficiency() == null
                        ? SkillProficiency.defaultActivityMinimum()
                        : dto.minimumProficiency(),
                required
        );
    }

    private static List<String> toInterestLabelList(List<InterestCategory> categories) {
        return safeList(categories).stream()
                .filter(Objects::nonNull)
                .map(InterestCategory::getLabel)
                .collect(Collectors.collectingAndThen(
                        Collectors.toMap(
                                ContractMapper::normalizedKey,
                                value -> value,
                                (existing, ignored) -> existing,
                                LinkedHashMap::new
                        ),
                        values -> new ArrayList<>(values.values())
                ))
                .stream()
                .toList();
    }

    private static List<InterestCategoryDTO> toInterestCategoryDTOList(List<InterestCategory> categories) {
        return safeList(categories).stream()
                .filter(Objects::nonNull)
                .distinct()
                .map(category -> new InterestCategoryDTO(
                        category.getCode(),
                        category.getLabel(),
                        category.getEscoConceptUri()
                ))
                .toList();
    }

    private static List<InterestCategory> toInterestCategoryEntityList(
            List<InterestCategoryDTO> categories,
            List<String> legacyNames
    ) {
        Map<String, InterestCategory> categoriesByCode = new LinkedHashMap<>();

        safeList(categories).stream()
                .map(ContractMapper::toInterestCategory)
                .filter(Objects::nonNull)
                .forEach(category -> categoriesByCode.put(category.getCode(), category));

        safeList(legacyNames).stream()
                .flatMap(name -> InterestCategory.fromFreeText(name).stream())
                .forEach(category -> categoriesByCode.put(category.getCode(), category));

        return new ArrayList<>(categoriesByCode.values());
    }

    private static InterestCategory toInterestCategory(InterestCategoryDTO dto) {
        if (dto == null) {
            return null;
        }

        return InterestCategory.fromText(dto.code())
                .or(() -> InterestCategory.fromText(dto.label()))
                .orElse(null);
    }

    private static <T> List<T> safeList(List<T> values) {
        return values == null ? List.of() : values;
    }

    private static List<String> cleanStringList(Collection<String> values) {
        return new ArrayList<>(cleanStringMap(values).values());
    }

    private static Set<String> cleanStringSet(Collection<String> values) {
        return new LinkedHashSet<>(cleanStringMap(values).values());
    }

    private static Map<String, String> cleanStringMap(Collection<String> values) {
        Map<String, String> cleanedByKey = new LinkedHashMap<>();

        if (values == null) {
            return cleanedByKey;
        }

        values.stream()
                .map(ContractMapper::cleanLabel)
                .filter(Objects::nonNull)
                .forEach(value -> cleanedByKey.putIfAbsent(normalizedKey(value), value));

        return cleanedByKey;
    }

    private static List<String> toInterestNameList(List<Interest> interests) {
        if (interests == null) {
            return List.of();
        }
        return interests.stream()
                .map(Interest::getName)
                .map(ContractMapper::normalizeInterestName)
                .filter(value -> value != null)
                .distinct()
                .toList();
    }

    private static String normalizeInterestName(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim().replaceAll("\\s+", " ");
        return trimmed.substring(0, 1).toUpperCase(Locale.ROOT)
                + trimmed.substring(1).toLowerCase(Locale.ROOT);
    }

    private static String cleanLabel(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().replaceAll("\\s+", " ");
    }

    private static String normalizedKey(String value) {
        return cleanLabel(value)
                .replace('_', ' ')
                .replace('-', ' ')
                .toLowerCase(Locale.ROOT)
                .replaceAll("\\s+", " ");
    }

    private static String blankToNull(String value) {
        return cleanLabel(value);
    }

    private static String skillKey(String name, String escoSkillUri) {
        String uri = blankToNull(escoSkillUri);
        if (uri != null) {
            return uri.toLowerCase(Locale.ROOT);
        }
        return cleanLabel(name).toLowerCase(Locale.ROOT);
    }

    private static String requirementKey(ActivitySkillRequirement requirement) {
        return skillKey(requirement.getName(), requirement.getEscoSkillUri()) + ":" + requirement.isRequiredSkill();
    }

    private static <T> Set<T> safeSet(Set<T> values) {
        return values == null ? Set.of() : values;
    }

}
