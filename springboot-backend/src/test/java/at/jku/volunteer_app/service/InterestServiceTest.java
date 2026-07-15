package at.jku.volunteer_app.service;

import at.jku.volunteer_app.contract.InterestCategoryDTO;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class InterestServiceTest {

    private final InterestService interestService = new InterestService();

    @Test
    void catalogIncludesAliasesUsedForInterestTranslation() {
        InterestCategoryDTO technology = interestService.getInterestCatalog().stream()
                .filter(category -> "TECHNOLOGY".equals(category.code()))
                .findFirst()
                .orElseThrow();

        assertThat(technology.aliases())
                .contains("coding", "programming", "digital skills");
        assertThat(technology.conceptUri()).startsWith("urn:volunteer-app:taxonomy:interests:");
        assertThat(technology.escoConceptUri()).isNull();
        assertThat(technology.relatedSkillLabels()).contains("Programming", "Problem-Solving");
    }
}
