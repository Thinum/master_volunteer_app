package at.jku.volunteer_app.repository;

import at.jku.volunteer_app.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    List<Appointment> findAllByCreatedByAndActivityIsNullOrderByStartDateTimeAsc(int createdBy);
}