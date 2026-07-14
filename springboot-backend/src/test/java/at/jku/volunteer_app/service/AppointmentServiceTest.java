package at.jku.volunteer_app.service;

import at.jku.volunteer_app.contract.AppointmentDTO;
import at.jku.volunteer_app.model.Appointment;
import at.jku.volunteer_app.repository.AppointmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {
    @Mock
    private AppointmentRepository appointmentRepository;

    private AppointmentService appointmentService;

    @BeforeEach
    void setUp() {
        appointmentService = new AppointmentService(appointmentRepository);
    }

    @Test
    void createsPersonalAppointmentForAuthenticatedUser() {
        Timestamp start = Timestamp.valueOf("2026-07-20 09:00:00");
        Timestamp end = Timestamp.valueOf("2026-07-20 10:00:00");
        AppointmentDTO request = new AppointmentDTO(99, " Dentist ", "Check-up", "Linz", start, end, 999, 12);
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Appointment created = appointmentService.createPersonalAppointment(request, 7);

        assertEquals("Dentist", created.getTitle());
        assertEquals(7, created.getCreatedBy());
        assertNull(created.getActivity());
        assertEquals(start, created.getStartDateTime());
        assertEquals(end, created.getEndDateTime());
    }

    @Test
    void rejectsAppointmentWhoseEndIsNotAfterStart() {
        Timestamp time = Timestamp.valueOf("2026-07-20 09:00:00");
        AppointmentDTO request = new AppointmentDTO(0, "Invalid", "", "", time, time, 0, null);

        assertThrows(ResponseStatusException.class,
                () -> appointmentService.createPersonalAppointment(request, 7));
    }
}