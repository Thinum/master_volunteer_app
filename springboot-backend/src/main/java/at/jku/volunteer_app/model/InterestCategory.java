package at.jku.volunteer_app.model;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

public enum InterestCategory {
    ANIMALS("Animals", null, "animal", "animal care", "pets", "wildlife", "shelter"),
    ENVIRONMENT_AND_NATURE("Environment and Nature", null, "environment", "environmental work", "environmental protection", "nature", "sustainability", "climate", "cleanup", "trees", "eco projects"),
    EDUCATION_AND_TUTORING("Education and Tutoring", null, "education", "teaching", "tutoring", "mentoring", "schools", "learning", "students"),
    CHILDREN_AND_YOUTH("Children and Youth", null, "children", "youth", "kids", "young people"),
    ELDERLY_SUPPORT("Elderly Support", null, "elderly", "seniors", "senior support"),
    HEALTH_AND_WELL_BEING("Health and Well-being", null, "health", "wellness", "wellbeing", "well-being", "mental health", "first aid"),
    EMERGENCY_AND_RESCUE_SERVICES("Emergency and Rescue Services", null, "emergency", "rescue", "fire service", "emergency response"),
    SPORTS_AND_FITNESS("Sports and Fitness", null, "sports", "fitness", "physical activity", "physical"),
    OUTDOOR_ACTIVITIES("Outdoor Activities", null, "outdoor", "outdoors", "hiking"),
    ARTS_AND_CULTURE("Arts and Culture", null, "arts", "culture", "concert"),
    MUSIC("Music", null, "music"),
    TECHNOLOGY("Technology", null, "technology", "programming", "coding", "digital skills", "social media"),
    CRAFTS_AND_REPAIR("Crafts and Repair", null, "crafts", "repair", "maintenance"),
    FOOD_AND_COOKING("Food and Cooking", null, "food", "cooking", "kitchen"),
    COMMUNITY_AND_SOCIAL_EVENTS("Community and Social Events", null, "community", "social", "event support", "events", "volunteering", "local projects"),
    HUMANITARIAN_AID("Humanitarian Aid", null, "humanitarian", "aid", "charity", "fundraising", "families", "vulnerable people", "social support"),
    ACCESSIBILITY_AND_INCLUSION("Accessibility and Inclusion", null, "accessibility", "inclusion", "diversity"),
    ORGANISATION_AND_LEADERSHIP("Organisation and Leadership", null, "organisation", "organization", "leadership", "coordination", "event planning");

    private static final Map<String, InterestCategory> LOOKUP = buildLookup();

    private final String label;
    private final String escoConceptUri;
    private final List<String> aliases;

    InterestCategory(String label, String escoConceptUri, String... aliases) {
        this.label = label;
        this.escoConceptUri = escoConceptUri;
        this.aliases = List.of(aliases);
    }

    public String getCode() {
        return name();
    }

    public String getLabel() {
        return label;
    }

    public String getEscoConceptUri() {
        return escoConceptUri;
    }

    public List<String> getAliases() {
        return aliases;
    }

    public static Optional<InterestCategory> fromText(String value) {
        return Optional.ofNullable(LOOKUP.get(normalize(value)));
    }

    public static List<InterestCategory> fromFreeText(String value) {
        String normalized = normalize(value);
        if (normalized == null) {
            return List.of();
        }

        Set<InterestCategory> matches = new LinkedHashSet<>();
        InterestCategory exactMatch = LOOKUP.get(normalized);
        if (exactMatch != null) {
            matches.add(exactMatch);
        }

        Arrays.stream(values())
                .filter(category -> category.matchesNormalizedText(normalized))
                .forEach(matches::add);

        return new ArrayList<>(matches);
    }

    public static List<InterestCategory> fromNames(List<String> values) {
        if (values == null) {
            return List.of();
        }

        return values.stream()
                .flatMap(value -> fromFreeText(value).stream())
                .distinct()
                .toList();
    }

    private boolean matchesNormalizedText(String normalizedText) {
        return normalizedText.contains(normalize(label))
                || aliases.stream()
                .map(InterestCategory::normalize)
                .anyMatch(alias -> alias != null && normalizedText.contains(alias));
    }

    private static Map<String, InterestCategory> buildLookup() {
        Map<String, InterestCategory> lookup = new LinkedHashMap<>();
        Arrays.stream(values()).forEach(category -> {
            lookup.put(normalize(category.name()), category);
            lookup.put(normalize(category.label), category);
            category.aliases.forEach(alias -> lookup.put(normalize(alias), category));
        });
        return lookup;
    }

    private static String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String normalized = value.trim()
                .replace('&', ' ')
                .replace('-', ' ')
                .replace('_', ' ')
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", " ")
                .trim()
                .replaceAll("\\s+", " ");

        return normalized.isBlank() ? null : normalized;
    }
}
