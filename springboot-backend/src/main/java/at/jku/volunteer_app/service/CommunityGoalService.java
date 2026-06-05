package at.jku.volunteer_app.service;

import at.jku.volunteer_app.model.CommunityGoal;
import at.jku.volunteer_app.repository.CommunityGoalRepository;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class CommunityGoalService {

    private final CommunityGoalRepository communityGoalRepository;
    private final OrganisationService organisationService;
    private final ActivityService activityService;

    public CommunityGoalService(CommunityGoalRepository communityGoalRepository,
                                OrganisationService organisationService,
                                ActivityService activityService) {
        this.communityGoalRepository = communityGoalRepository;
        this.organisationService = organisationService;
        this.activityService = activityService;
    }

    public CommunityGoal createGoal(CommunityGoal goal, int organisationId) {
        goal.setOrganisation(organisationService.getOrganisationById(organisationId));
        goal.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        goal.setStatus("ACTIVE");
        return communityGoalRepository.save(goal);
    }

    public List<CommunityGoal> getGoalsForOrganisation(int orgId) {
        return communityGoalRepository.findByOrganisationId(orgId);
    }

    public CommunityGoal getGoalById(int id) {
        return communityGoalRepository.findById(id).orElse(null);
    }

    public CommunityGoal updateGoal(CommunityGoal goal) {
        goal.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
        return communityGoalRepository.save(goal);
    }

    public boolean deleteGoal(int id) {
        if (!communityGoalRepository.existsById(id)) {
            return false;
        }
        communityGoalRepository.deleteById(id);
        return true;
    }

    // Progress-Berechnung: hier später Szenario-2-Logik einbauen
    // z.B. Activities der Organisation im Zeitraum zählen
    public int calculateCurrentValue(int goalId) {
        CommunityGoal goal = getGoalById(goalId);
        if (goal == null) {
            return 0;
        }

        // TODO: echte Logik einbauen:
        // Activities der Organisation im Zeitraum [startDate, endDate] holen
        // und daraus currentValue berechnen.
        // Platzhalter: 0
        return 0;
    }
}