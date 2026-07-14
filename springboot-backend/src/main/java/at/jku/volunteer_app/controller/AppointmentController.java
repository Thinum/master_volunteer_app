package at.jku.volunteer_app.controller;

import at.jku.volunteer_app.contract.AppointmentDTO;
import at.jku.volunteer_app.contract.ContractMapper;
import at.jku.volunteer_app.model.UserModelDetails;
import at.jku.volunteer_app.service.AppointmentService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {
    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping("/me")
    public List<AppointmentDTO> getPersonalAppointments(@AuthenticationPrincipal UserModelDetails userDetails) {
        return appointmentService.getPersonalAppointments(requireUser(userDetails)).stream()
                .map(ContractMapper::toAppointmentDTO)
                .toList();
    }

    @PostMapping("/me")
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentDTO createPersonalAppointment(@AuthenticationPrincipal UserModelDetails userDetails,
                                                    @RequestBody AppointmentDTO appointment) {
        return ContractMapper.toAppointmentDTO(
                appointmentService.createPersonalAppointment(appointment, requireUser(userDetails))
        );
    }

    @DeleteMapping("/me/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePersonalAppointment(@AuthenticationPrincipal UserModelDetails userDetails,
                                          @PathVariable int id) {
        appointmentService.deletePersonalAppointment(id, requireUser(userDetails));
    }

    private int requireUser(UserModelDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        return userDetails.getUserId();
    }
}