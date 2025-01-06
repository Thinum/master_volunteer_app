package univ.iwa.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import univ.iwa.model._Organisation;
import univ.iwa.repository._OrganisationRepository;

import java.util.List;

@Service
public class _OrganisationService {
    @Autowired
    private _OrganisationRepository organisationRepository;

    public List<_Organisation> getAllOrganisations(){
        return organisationRepository.findAll();
    }

    public _Organisation getOrganisationById(int id) {
        return organisationRepository.findById(id).get();
    }

    public _Organisation addOrganisation(_Organisation organisation) {
        return organisationRepository.save(organisation);
    }

    public _Organisation updateOrganisation(_Organisation organisation) {
        return organisationRepository.save(organisation);
    }

    public boolean deleteOrganisation(int id) {
        return false;
        //TODO: Change
    }
}
