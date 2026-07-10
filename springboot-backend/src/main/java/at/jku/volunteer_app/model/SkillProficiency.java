package at.jku.volunteer_app.model;

import java.util.Arrays;

public enum SkillProficiency {
    BEGINNER(1),
    INTERMEDIATE(2),
    ADVANCED(3);

    private final int level;

    SkillProficiency(int level) {
        this.level = level;
    }

    public int getLevel() {
        return level;
    }

    public boolean meets(SkillProficiency minimum) {
        if (minimum == null) {
            return true;
        }
        return level >= minimum.level;
    }

    public static SkillProficiency defaultUserLevel() {
        return INTERMEDIATE;
    }

    public static SkillProficiency defaultActivityMinimum() {
        return BEGINNER;
    }

    public static SkillProficiency fromText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String normalized = value.trim().replace('-', '_').replace(' ', '_').toUpperCase();
        return Arrays.stream(values())
                .filter(level -> level.name().equals(normalized))
                .findFirst()
                .orElse(null);
    }
}
