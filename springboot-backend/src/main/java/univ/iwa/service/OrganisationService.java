package univ.iwa.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import univ.iwa.model.Organisation;
import univ.iwa.repository.OrganisationRepository;

import java.util.List;

@Service
public class OrganisationService {
    @Autowired
    private OrganisationRepository organisationRepository;

    public List<Organisation> getAllOrganisations(){
        return organisationRepository.findAll();
    }

    public Organisation getOrganisationById(int id) {
        return organisationRepository.findById(id).get();
    }

    public Organisation addOrganisation(Organisation organisation) {
        return organisationRepository.save(organisation);
    }

    public Organisation updateOrganisation(Organisation organisation) {
        return organisationRepository.save(organisation);
    }

    public boolean deleteOrganisation(int id) {
        return false;
        //TODO: Change
    }
}
