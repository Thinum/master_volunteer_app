package at.jku.volunteer_app.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
    private List<UserSkill> skillProfiles;

    @ElementCollection
    @CollectionTable(name = "user_interests", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "interest")
    @Convert(converter = InterestCategoryConverter.class)
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

        this.skillProfiles = skills.stream()
                .filter(skill -> skill != null && !skill.isBlank())
                .map(String::trim)
                .distinct()
                .map(UserSkill::fromName)
                .toList();
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
        this.interestCategories = interests == null
                ? new ArrayList<>()
                : InterestCategory.fromNames(interests);
    }
}
