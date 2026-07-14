package at.jku.volunteer_app.contract;

import java.util.Set;

public record UpdateOrganisationAdminsRequest(Set<Integer> adminIds) {
}
