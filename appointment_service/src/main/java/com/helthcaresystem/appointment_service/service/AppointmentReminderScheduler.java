package com.helthcaresystem.appointment_service.service;

import com.helthcaresystem.appointment_service.model.entity.Appointment;
import com.helthcaresystem.appointment_service.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentReminderScheduler {

    private static final List<Appointment.Status> DAY_BEFORE_REMINDER_STATUSES = List.of(
            Appointment.Status.ACCEPTED,
            Appointment.Status.RESCHEDULED
    );
    private static final List<Appointment.Status> ONE_HOUR_REMINDER_STATUSES = List.of(
            Appointment.Status.ACCEPTED,
            Appointment.Status.RESCHEDULED
    );

    private final AppointmentRepository appointmentRepository;
    private final AppointmentNotificationService appointmentNotificationService;

    @Scheduled(cron = "${appointments.reminder.scheduler-cron:0 */5 * * * *}")
    @Transactional
    public void sendReminders() {
        sendExpiredUnacceptedBookedNotifications();
        sendTomorrowReminders();
        sendPendingAcceptanceTwoHourReminders();
        sendOneHourBeforeReminders();
    }

    private void sendExpiredUnacceptedBookedNotifications() {
        LocalDateTime now = LocalDateTime.now();
        List<Appointment> bookedAppointments = appointmentRepository
                .findByStatusAndScheduledAtBeforeAndExpiredUnacceptedNotifiedFalse(
                        Appointment.Status.BOOKED,
                        now
                );
        List<Appointment> rescheduledAppointments = appointmentRepository
                .findByStatusAndScheduledAtBeforeAndExpiredUnacceptedNotifiedFalse(
                        Appointment.Status.RESCHEDULED,
                        now
                );

        for (Appointment appointment : bookedAppointments) {
            appointmentNotificationService.notifyUnacceptedAppointmentExpired(appointment, null);
            appointment.setExpiredUnacceptedNotified(true);
            appointment.setStatus(Appointment.Status.EXPIRED);
            appointment.setStatusReasonType("AUTO_EXPIRED");
            appointment.setCancellationReason("Appointment expired because it was not accepted in time.");
        }
        for (Appointment appointment : rescheduledAppointments) {
            appointmentNotificationService.notifyRescheduledUnacceptedAppointmentExpired(appointment, null);
            appointment.setExpiredUnacceptedNotified(true);
            appointment.setStatus(Appointment.Status.EXPIRED);
            appointment.setStatusReasonType("AUTO_EXPIRED");
            appointment.setCancellationReason("Rescheduled appointment expired because it was not accepted in time.");
        }
    }

    private void sendTomorrowReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        LocalDateTime start = tomorrow.atStartOfDay();
        LocalDateTime end = tomorrow.plusDays(1).atStartOfDay();

        List<Appointment> appointments = appointmentRepository
                .findByStatusInAndScheduledAtBetweenAndReminderDayBeforeSentFalse(
                        DAY_BEFORE_REMINDER_STATUSES,
                        start,
                        end
                );

        for (Appointment appointment : appointments) {
            appointmentNotificationService.notifyReminderTomorrow(appointment, null);
            appointment.setReminderDayBeforeSent(true);
        }
    }

    private void sendPendingAcceptanceTwoHourReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.plusHours(2);
        LocalDateTime end = start.plusMinutes(5);

        List<Appointment> appointments = appointmentRepository
                .findByStatusAndScheduledAtBetweenAndReminderTwoHourPendingAcceptanceSentFalse(
                        Appointment.Status.BOOKED,
                        start,
                        end
                );

        for (Appointment appointment : appointments) {
            appointmentNotificationService.notifyDoctorPendingAcceptanceReminder(appointment, null);
            appointment.setReminderTwoHourPendingAcceptanceSent(true);
        }
    }

    private void sendOneHourBeforeReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.plusHours(1);
        LocalDateTime end = start.plusMinutes(5);

        List<Appointment> appointments = appointmentRepository
                .findByStatusInAndScheduledAtBetweenAndReminderOneHourBeforeSentFalse(
                        ONE_HOUR_REMINDER_STATUSES,
                        start,
                        end
                );

        for (Appointment appointment : appointments) {
            appointmentNotificationService.notifyReminderOneHourBefore(appointment, null);
            appointment.setReminderOneHourBeforeSent(true);
        }
    }
}
