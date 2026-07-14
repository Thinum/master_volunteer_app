package at.jku.volunteer_app.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user")
@Inheritance(strategy = InheritanceType.JOINED)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    private String name;
    private String email;
    @JsonIgnore
    private String password;
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String profilePicture;
    private String phone;
    private boolean isActive = true;

    @ElementCollection
    @CollectionTable(name = "user_skills", joinColumns = @JoinColumn(name = "user_id"))
    @OrderColumn(name = "skill_order")
    private List<UserSkill> skillProfiles;

    @ElementCollection
    @CollectionTable(name = "user_interests", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "interest")
    @Convert(converter = InterestCategoryConverter.class)
    @OrderColumn(name = "interest_order")
    private List<InterestCategory> interestCategories;

    @Temporal(TemporalType.TIMESTAMP)
    private Timestamp joinedAt;

    private String username;


    @OneToMany(mappedBy = "fromUser",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    @JsonIgnore
    private List<UserRelationship> relationshipsFrom;

    @OneToMany(mappedBy = "toUser",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    @JsonIgnore
    private List<UserRelationship> relationshipsTo;

    @OneToMany(mappedBy = "user",
        cascade = CascadeType.ALL,
        orphanRemoval = true)
    @JsonIgnore
    private List<Notification> notifications;

    @Transient
    public List<String> getSkills() {
        if (skillProfiles == null) {
            return List.of();
        }

        return skillProfiles.stream()
                .map(UserSkill::getName)
                .filter(Objects::nonNull)
                .toList();
    }

    public void setSkills(List<String> skills) {
        if (skills == null) {
            this.skillProfiles = List.of();
            return;
        }

        setSkillProfiles(skills.stream()
                .filter(skill -> skill != null && !skill.isBlank())
                .map(String::trim)
                .distinct()
                .map(UserSkill::fromName)
                .toList());
    }

    public void setSkillProfiles(List<UserSkill> skillProfiles) {
        if (skillProfiles == null) {
            this.skillProfiles = List.of();
            return;
        }

        Map<String, UserSkill> skillsByKey = new LinkedHashMap<>();
        skillProfiles.stream()
                .filter(Objects::nonNull)
                .map(skill -> new UserSkill(
                        cleanLabel(skill.getName()),
                        cleanLabel(skill.getEscoSkillUri()),
                        skill.getProficiencyOrDefault()
                ))
                .filter(skill -> skill.getName() != null)
                .forEach(skill -> skillsByKey.putIfAbsent(skillKey(skill), skill));

        this.skillProfiles = new ArrayList<>(skillsByKey.values());
    }

    @Transient
    public List<String> getInterests() {
        if (interestCategories == null) {
            return List.of();
        }

        return interestCategories.stream()
                .filter(Objects::nonNull)
                .map(InterestCategory::getLabel)
                .distinct()
                .toList();
    }

    public void setInterests(List<String> interests) {
        setInterestCategories(interests == null
                ? new ArrayList<>()
                : InterestCategory.fromNames(interests));
    }

    public void setInterestCategories(List<InterestCategory> interestCategories) {
        this.interestCategories = interestCategories == null
                ? new ArrayList<>()
                : new ArrayList<>(interestCategories.stream()
                .filter(Objects::nonNull)
                .distinct()
                .toList());
    }

    private String skillKey(UserSkill skill) {
        if (skill.getEscoSkillUri() != null) {
            return skill.getEscoSkillUri().toLowerCase(Locale.ROOT);
        }
        return skill.getName().toLowerCase(Locale.ROOT);
    }

    private String cleanLabel(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().replaceAll("\\s+", " ");
    }
}
