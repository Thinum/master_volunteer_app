package at.jku.volunteer_app.service;

import at.jku.volunteer_app.contract.InterestCategoryDTO;
import at.jku.volunteer_app.model.InterestCategory;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class InterestService {

    public List<String> getAllInterestNames() {
        return Arrays.stream(InterestCategory.values())
                .map(InterestCategory::getLabel)
                .toList();
    }

    public List<InterestCategoryDTO> getInterestCatalog() {
        return Arrays.stream(InterestCategory.values())
                .map(category -> new InterestCategoryDTO(
                        category.getCode(),
                        category.getLabel(),
                        category.getConceptUri(),
                        category.getConceptSchemeUri(),
                        category.getEscoConceptUri(),
                        category.getAliases(),
                        category.getBroaderConceptUris(),
                        category.getRelatedSkillLabels()
                ))
                .toList();
    }
}
