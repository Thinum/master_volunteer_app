package at.jku.volunteer_app.service;

import at.jku.volunteer_app.repository.InterestRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class InterestService {

    private final InterestRepository interestRepository;

    public InterestService(InterestRepository interestRepository) {
        this.interestRepository = interestRepository;
    }

    public List<String> getAllInterestNames() {
        return interestRepository.findAll().stream()
                .map(interest -> interest.getName())
                .map(this::normalizeInterestName)
                .filter(interest -> interest != null)
                .distinct()
                .sorted(String::compareToIgnoreCase)
                .toList();
    }

    private String normalizeInterestName(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim().replaceAll("\\s+", " ");
        return trimmed.substring(0, 1).toUpperCase(Locale.ROOT)
                + trimmed.substring(1).toLowerCase(Locale.ROOT);
    }
}
