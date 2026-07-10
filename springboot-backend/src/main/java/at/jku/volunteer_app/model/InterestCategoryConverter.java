package at.jku.volunteer_app.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class InterestCategoryConverter implements AttributeConverter<InterestCategory, String> {

    @Override
    public String convertToDatabaseColumn(InterestCategory attribute) {
        return attribute == null ? null : attribute.getLabel();
    }

    @Override
    public InterestCategory convertToEntityAttribute(String dbData) {
        return InterestCategory.fromText(dbData).orElse(null);
    }
}
