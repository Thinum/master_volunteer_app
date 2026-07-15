package at.jku.volunteer_app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "activity", indexes = @Index(name = "idx_activity_project", columnList = "project_id"))
public class Activity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String body;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "project_id")
    private int projectId;

    @ManyToMany
    @JoinTable(
        name = "activity_organisations",
        joinColumns = @JoinColumn(name = "activity_id"),
        inverseJoinColumns = @JoinColumn(name = "organisation_id")
    )
    private List<Organisation> organisations;

    @OneToMany(mappedBy = "activity", cascade = CascadeType.ALL)
    private List<Appointment> appointments;

    private Timestamp date;
    private String startTime;
    private String endTime;
    private String duration;
    private Timestamp expiresAt;

    private String location;
    private Coordinates coordinates;

    @ManyToMany
    @JoinTable(
        name = "activity_participants",
        joinColumns = @JoinColumn(name = "activity_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> participants;

    @ManyToOne
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @ElementCollection
    @CollectionTable(name = "activity_skills", joinColumns = @JoinColumn(name = "activity_id"))
    private List<ActivitySkillRequirement> skillRequirements;

    @ElementCollection
    @CollectionTable(name = "activity_categories", joinColumns = @JoinColumn(name = "activity_id"))
    @Column(name = "category")
    @Convert(converter = InterestCategoryConverter.class)
    private List<InterestCategory> categories;

    @ElementCollection
    private List<String> qualifications;

    @ElementCollection
    private List<String> prerequisites;

    private int capacity;
    private int spotsTaken;

    @ElementCollection
    private List<String> equipmentProvided;

    @ElementCollection
    @CollectionTable(name = "activity_tags", joinColumns = @JoinColumn(name = "activity_id"))
    @Column(name = "tags")
    private List<String> tags;

    private String difficulty;
    private boolean isPublic;

    @Enumerated(EnumType.STRING)
    private ActivityStatus status;

    private Timestamp createdAt;
    private Timestamp updatedAt;

    @Transient
    public List<String> getSkills() {
        if (skillRequirements == null) {
            return List.of();
        }

        return skillRequirements.stream()
                .map(ActivitySkillRequirement::getName)
                .filter(Objects::nonNull)
                .toList();
    }

    public void setSkills(List<String> skills) {
        if (skills == null) {
            this.skillRequirements = new ArrayList<>();
            return;
        }

        this.skillRequirements = new ArrayList<>(skills.stream()
                .filter(skill -> skill != null && !skill.isBlank())
                .map(String::trim)
                .distinct()
                .map(ActivitySkillRequirement::required)
                .toList());
    }

    @Transient
    public List<ActivitySkillRequirement> getRequiredSkills() {
        return getSkillRequirementsByRequiredFlag(true);
    }

    @Transient
    public List<ActivitySkillRequirement> getPreferredSkills() {
        return getSkillRequirementsByRequiredFlag(false);
    }

    public void setRequiredSkills(List<ActivitySkillRequirement> requiredSkills) {
        replaceSkillRequirements(requiredSkills, true);
    }

    public void setPreferredSkills(List<ActivitySkillRequirement> preferredSkills) {
        replaceSkillRequirements(preferredSkills, false);
    }

    private List<ActivitySkillRequirement> getSkillRequirementsByRequiredFlag(boolean required) {
        if (skillRequirements == null) {
            return List.of();
        }

        return skillRequirements.stream()
                .filter(requirement -> requirement != null && requirement.isRequiredSkill() == required)
                .toList();
    }

    private void replaceSkillRequirements(List<ActivitySkillRequirement> replacements, boolean required) {
        List<ActivitySkillRequirement> updated = new ArrayList<>();
        if (skillRequirements != null) {
            updated.addAll(skillRequirements.stream()
                    .filter(requirement -> requirement != null && requirement.isRequiredSkill() != required)
                    .toList());
        }

        if (replacements != null) {
            replacements.stream()
                    .filter(Objects::nonNull)
                    .map(requirement -> new ActivitySkillRequirement(
                            requirement.getName(),
                            requirement.getEscoSkillUri(),
                            requirement.getMinimumProficiencyOrDefault(),
                            required
                    ))
                    .forEach(updated::add);
        }

        this.skillRequirements = updated;
    }
}
