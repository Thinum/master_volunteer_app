package at.jku.volunteer_app.service;

import at.jku.volunteer_app.contract.AppointmentDTO;
import at.jku.volunteer_app.model.Appointment;
import at.jku.volunteer_app.repository.AppointmentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;

    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public List<Appointment> getPersonalAppointments(int userId) {
        return appointmentRepository.findAllByCreatedByAndActivityIsNullOrderByStartDateTimeAsc(userId);
    }

    public Appointment createPersonalAppointment(AppointmentDTO request, int userId) {
        validate(request);
        Appointment appointment = new Appointment();
        appointment.setTitle(request.title().trim());
        appointment.setDescription(request.description() == null ? "" : request.description().trim());
        appointment.setLocation(request.location() == null ? "" : request.location().trim());
        appointment.setStartDateTime(request.startDateTime());
        appointment.setEndDateTime(request.endDateTime());
        appointment.setCreatedBy(userId);
        appointment.setActivity(null);
        return appointmentRepository.save(appointment);
    }

    public void deletePersonalAppointment(int appointmentId, int userId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        if (appointment.getActivity() != null || appointment.getCreatedBy() != userId) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Appointment does not belong to this user");
        }
        appointmentRepository.delete(appointment);
    }

    private void validate(AppointmentDTO request) {
        if (request.title() == null || request.title().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title is required");
        }
        if (request.startDateTime() == null || request.endDateTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start and end time are required");
        }
        if (!request.endDateTime().after(request.startDateTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }
    }
}