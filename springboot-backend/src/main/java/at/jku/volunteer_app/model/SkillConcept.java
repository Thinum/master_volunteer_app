package at.jku.volunteer_app.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "skill_concept")
public class SkillConcept {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    @Column(name = "concept_uri", unique = true, length = 700)
    private String conceptUri;

    @Column(name = "preferred_label", nullable = false)
    private String preferredLabel;

    @Column(name = "normalized_label", nullable = false, unique = true)
    private String normalizedLabel;

    @ElementCollection
    @CollectionTable(name = "skill_concept_alternative_labels", joinColumns = @JoinColumn(name = "skill_concept_id"))
    @Column(name = "alternative_label")
    @OrderColumn(name = "label_order")
    private List<String> alternativeLabels = new ArrayList<>();

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "skill_type")
    private String skillType;

    @Column(name = "reuse_level")
    private String reuseLevel;

    @ElementCollection
    @CollectionTable(name = "skill_concept_broader_relations", joinColumns = @JoinColumn(name = "skill_concept_id"))
    @Column(name = "broader_concept_uri", length = 700)
    @OrderColumn(name = "relation_order")
    private List<String> broaderConceptUris = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "skill_concept_interest_relations", joinColumns = @JoinColumn(name = "skill_concept_id"))
    @Column(name = "interest_code")
    @OrderColumn(name = "relation_order")
    private List<String> relatedInterestCodes = new ArrayList<>();

    private String source;

    @Column(name = "source_version")
    private String sourceVersion;
}
