package com.helthcaresystem.appointment_service.service;

import com.helthcaresystem.appointment_service.client.DoctorProfileClient;
import com.helthcaresystem.appointment_service.dto.*;
import com.helthcaresystem.appointment_service.model.entity.DoctorAvailability;
import com.helthcaresystem.appointment_service.repository.DoctorAvailabilityRepository;
import com.helthcaresystem.appointment_service.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorAvailabilityService {

    private static final List<String> ALL_DAYS = List.of(
            "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"
    );
    private static final LocalTime UNAVAILABLE_START_TIME = LocalTime.MIDNIGHT;
    private static final LocalTime UNAVAILABLE_END_TIME = LocalTime.of(0, 1);
    private static final List<AvailabilityTimeSlotResponse> DEFAULT_TIME_SLOTS = List.of(
            AvailabilityTimeSlotResponse.builder()
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(17, 0))
                    .build()
    );

    private final DoctorAvailabilityRepository doctorAvailabilityRepository;
    private final DoctorProfileClient doctorProfileClient;

    public DoctorAvailability addAvailability(AvailabilityRequest request, AuthenticatedUser user) {
        Long doctorId = resolveDoctorId(request.getDoctorId(), user);
        validateDayOfWeek(request.getDayOfWeek());
        validateTimeRange(request.getStartTime(), request.getEndTime());

        DoctorAvailability slot = new DoctorAvailability();
        slot.setDoctorId(doctorId);
        slot.setDayOfWeek(request.getDayOfWeek().toUpperCase(Locale.ROOT));
        slot.setStartTime(request.getStartTime());
        slot.setEndTime(request.getEndTime());
        slot.setStatus(request.resolveStatus());
        slot.setSpecificDate(null);
        return doctorAvailabilityRepository.save(slot);
    }

    public List<DoctorAvailability> getDoctorSlots(Long doctorId, AuthenticatedUser user) {
        authorizeDoctorAccess(doctorId, user);
        return doctorAvailabilityRepository.findByDoctorIdAndSpecificDateIsNull(doctorId).stream()
                .sorted(Comparator
                        .comparing((DoctorAvailability slot) -> dayOrder(slot.getDayOfWeek()))
                        .thenComparing(slot -> Optional.ofNullable(slot.getStartTime()).orElse(LocalTime.MIN)))
                .toList();
    }

    public List<DoctorAvailability> getAvailableSlots(Long doctorId, LocalDate date) {
        List<DoctorAvailability> overrideSlots = doctorAvailabilityRepository.findByDoctorIdAndSpecificDate(doctorId, date);
        if (!overrideSlots.isEmpty()) {
            if (isUnavailableDay(overrideSlots)) {
                return List.of();
            }
            return sortSlots(filterAvailableSlots(overrideSlots));
        }

        List<DoctorAvailability> weeklySlots = doctorAvailabilityRepository.findByDoctorIdAndSpecificDateIsNull(doctorId);
        if (weeklySlots.isEmpty()) {
            return buildDefaultAvailability(doctorId, date);
        }

        String dayOfWeek = date.getDayOfWeek().name();
        List<DoctorAvailability> daySlots = weeklySlots.stream()
                .filter(slot -> dayOfWeek.equalsIgnoreCase(slot.getDayOfWeek()))
                .toList();

        if (daySlots.isEmpty() || isUnavailableDay(daySlots)) {
            return List.of();
        }

        return sortSlots(filterAvailableSlots(daySlots));
    }

    public DoctorAvailability updateAvailability(Long slotId, AvailabilityRequest request, AuthenticatedUser user) {
        DoctorAvailability existing = doctorAvailabilityRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Availability slot not found."));
        authorizeDoctorAccess(existing.getDoctorId(), user);

        if (request.getDayOfWeek() != null) {
            validateDayOfWeek(request.getDayOfWeek());
            existing.setDayOfWeek(request.getDayOfWeek().toUpperCase(Locale.ROOT));
        }
        if (request.getStartTime() != null) {
            existing.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            existing.setEndTime(request.getEndTime());
        }
        if (request.getAvailable() != null) {
            existing.setStatus(request.resolveStatus());
        }

        if (existing.getStatus() == DoctorAvailability.Status.AVAILABLE) {
            validateTimeRange(existing.getStartTime(), existing.getEndTime());
        }
        return doctorAvailabilityRepository.save(existing);
    }

    public void deleteAvailability(Long slotId, AuthenticatedUser user) {
        DoctorAvailability existing = doctorAvailabilityRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Availability slot not found."));
        authorizeDoctorAccess(existing.getDoctorId(), user);
        doctorAvailabilityRepository.deleteById(slotId);
    }

    public AvailabilityConfigResponse getAvailabilityConfig(Long doctorId, AuthenticatedUser user) {
        authorizeDoctorAccess(doctorId, user);

        List<DoctorAvailability> weeklySlots = doctorAvailabilityRepository.findByDoctorIdAndSpecificDateIsNull(doctorId);
        boolean usingDefaultSchedule = weeklySlots.isEmpty();

        List<String> availableDays = usingDefaultSchedule
                ? ALL_DAYS
                : weeklySlots.stream()
                .filter(slot -> slot.getStatus() == DoctorAvailability.Status.AVAILABLE)
                .map(DoctorAvailability::getDayOfWeek)
                .filter(Objects::nonNull)
                .distinct()
                .sorted(Comparator.comparingInt(this::dayOrder))
                .toList();

        List<AvailabilityTimeSlotResponse> defaultSlots = usingDefaultSchedule
                ? DEFAULT_TIME_SLOTS
                : weeklySlots.stream()
                .filter(slot -> slot.getStatus() == DoctorAvailability.Status.AVAILABLE)
                .filter(slot -> slot.getStartTime() != null && slot.getEndTime() != null)
                .map(slot -> AvailabilityTimeSlotResponse.builder()
                        .startTime(slot.getStartTime())
                        .endTime(slot.getEndTime())
                        .build())
                .distinct()
                .sorted(Comparator.comparing(AvailabilityTimeSlotResponse::getStartTime))
                .toList();

        List<AvailabilityDateOverrideResponse> dateOverrides = doctorAvailabilityRepository.findByDoctorId(doctorId).stream()
                .filter(slot -> slot.getSpecificDate() != null)
                .collect(Collectors.groupingBy(DoctorAvailability::getSpecificDate, TreeMap::new, Collectors.toList()))
                .values().stream()
                .map(this::toDateOverrideResponse)
                .toList();

        return AvailabilityConfigResponse.builder()
                .doctorId(doctorId)
                .availableDays(availableDays)
                .defaultSlots(defaultSlots.isEmpty() ? DEFAULT_TIME_SLOTS : defaultSlots)
                .dateOverrides(dateOverrides)
                .usingDefaultSchedule(usingDefaultSchedule)
                .build();
    }

    @Transactional
    public AvailabilityConfigResponse updateWeeklyAvailability(AvailabilityConfigRequest request, AuthenticatedUser user) {
        Long doctorId = resolveDoctorId(request.getDoctorId(), user);
        Set<String> availableDays = normalizeDays(request.getAvailableDays());
        List<AvailabilityTimeSlotRequest> requestedSlots = normalizeTimeSlotRequests(request.getDefaultSlots());

        doctorAvailabilityRepository.deleteByDoctorIdAndSpecificDateIsNull(doctorId);

        List<DoctorAvailability> weeklyRows = new ArrayList<>();
        for (String day : ALL_DAYS) {
            if (availableDays.contains(day)) {
                for (AvailabilityTimeSlotRequest slot : requestedSlots) {
                    validateTimeRange(slot.getStartTime(), slot.getEndTime());
                    weeklyRows.add(buildSlot(doctorId, day, null, slot.getStartTime(), slot.getEndTime(), DoctorAvailability.Status.AVAILABLE));
                }
            } else {
                weeklyRows.add(buildSlot(doctorId, day, null, null, null, DoctorAvailability.Status.UNAVAILABLE));
            }
        }

        doctorAvailabilityRepository.saveAll(weeklyRows);
        return getAvailabilityConfig(doctorId, user);
    }

    @Transactional
    public AvailabilityDateOverrideResponse upsertDateOverride(AvailabilityDateOverrideRequest request, AuthenticatedUser user) {
        Long doctorId = resolveDoctorId(request.getDoctorId(), user);
        LocalDate date = Objects.requireNonNull(request.getDate(), "Date is required.");
        List<AvailabilityTimeSlotRequest> requestedSlots = request.getSlots() == null ? List.of() : request.getSlots();
        boolean unavailable = Boolean.TRUE.equals(request.getUnavailable());

        if (!unavailable && requestedSlots.isEmpty()) {
            throw new IllegalArgumentException("Provide at least one slot or mark the date unavailable.");
        }

        doctorAvailabilityRepository.deleteByDoctorIdAndSpecificDate(doctorId, date);

        List<DoctorAvailability> overrideRows = new ArrayList<>();
        if (unavailable) {
            overrideRows.add(buildSlot(doctorId, date.getDayOfWeek().name(), date, null, null, DoctorAvailability.Status.UNAVAILABLE));
        } else {
            for (AvailabilityTimeSlotRequest slot : normalizeTimeSlotRequests(requestedSlots)) {
                validateTimeRange(slot.getStartTime(), slot.getEndTime());
                overrideRows.add(buildSlot(
                        doctorId,
                        date.getDayOfWeek().name(),
                        date,
                        slot.getStartTime(),
                        slot.getEndTime(),
                        DoctorAvailability.Status.AVAILABLE
                ));
            }
        }

        return toDateOverrideResponse(doctorAvailabilityRepository.saveAll(overrideRows));
    }

    @Transactional
    public void deleteDateOverride(Long doctorId, LocalDate date, AuthenticatedUser user) {
        authorizeDoctorAccess(doctorId, user);
        doctorAvailabilityRepository.deleteByDoctorIdAndSpecificDate(doctorId, date);
    }

    public List<DoctorSummaryResponse> getAvailableDoctors(String query, String specialization, String authHeader) {
        Map<Long, List<DoctorAvailability>> groupedByDoctor = doctorAvailabilityRepository
                .findByStatus(DoctorAvailability.Status.AVAILABLE)
                .stream()
                .filter(slot -> slot.getSpecificDate() == null)
                .collect(Collectors.groupingBy(DoctorAvailability::getDoctorId));
        Map<Long, DoctorProfileClient.DoctorOption> doctorOptions = doctorProfileClient.getDoctorOptions(authHeader);

        String normalizedQuery = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        String normalizedSpecialization = specialization == null ? "" : specialization.trim().toLowerCase(Locale.ROOT);

        return groupedByDoctor.entrySet().stream()
                .map(entry -> {
                    DoctorProfileClient.DoctorOption option = doctorOptions.get(entry.getKey());
                    return DoctorSummaryResponse.fromAvailability(
                            entry.getKey(),
                            entry.getValue(),
                            option == null ? null : option.getFullName(),
                            option == null ? "" : option.getSpecialization(),
                            option == null ? "" : option.getQualifications(),
                            option == null ? null : option.getExperienceYears()
                    );
                })
                .filter(doctor -> normalizedQuery.isBlank()
                        || doctor.getName().toLowerCase(Locale.ROOT).contains(normalizedQuery))
                .filter(doctor -> normalizedSpecialization.isBlank()
                        || "all".equals(normalizedSpecialization)
                        || doctor.getSpecialization().toLowerCase(Locale.ROOT).contains(normalizedSpecialization))
                .sorted(Comparator.comparing(DoctorSummaryResponse::getName))
                .toList();
    }

    public DoctorSummaryResponse getDoctorSummary(Long doctorId, String authHeader) {
        List<DoctorAvailability> slots = doctorAvailabilityRepository.findByDoctorIdAndSpecificDateIsNull(doctorId).stream()
                .filter(slot -> slot.getStatus() == DoctorAvailability.Status.AVAILABLE)
                .toList();
        if (slots.isEmpty()) {
            throw new IllegalArgumentException("Doctor not found.");
        }
        DoctorProfileClient.DoctorOption option = doctorProfileClient.getDoctorOptions(authHeader).get(doctorId);
        return DoctorSummaryResponse.fromAvailability(
                doctorId,
                slots,
                option == null ? null : option.getFullName(),
                option == null ? "" : option.getSpecialization(),
                option == null ? "" : option.getQualifications(),
                option == null ? null : option.getExperienceYears()
        );
    }

    private DoctorAvailability buildSlot(Long doctorId,
                                         String dayOfWeek,
                                         LocalDate specificDate,
                                         LocalTime startTime,
                                         LocalTime endTime,
                                         DoctorAvailability.Status status) {
        LocalTime resolvedStartTime = startTime;
        LocalTime resolvedEndTime = endTime;
        if (status == DoctorAvailability.Status.UNAVAILABLE) {
            resolvedStartTime = UNAVAILABLE_START_TIME;
            resolvedEndTime = UNAVAILABLE_END_TIME;
        }

        DoctorAvailability slot = new DoctorAvailability();
        slot.setDoctorId(doctorId);
        slot.setDayOfWeek(dayOfWeek);
        slot.setSpecificDate(specificDate);
        slot.setStartTime(resolvedStartTime);
        slot.setEndTime(resolvedEndTime);
        slot.setStatus(status);
        return slot;
    }

    private AvailabilityDateOverrideResponse toDateOverrideResponse(List<DoctorAvailability> slots) {
        LocalDate date = slots.get(0).getSpecificDate();
        List<AvailabilityTimeSlotResponse> timeSlots = filterAvailableSlots(slots).stream()
                .map(slot -> AvailabilityTimeSlotResponse.builder()
                        .startTime(slot.getStartTime())
                        .endTime(slot.getEndTime())
                        .build())
                .sorted(Comparator.comparing(AvailabilityTimeSlotResponse::getStartTime))
                .toList();

        return AvailabilityDateOverrideResponse.builder()
                .date(date)
                .dayOfWeek(date.getDayOfWeek().name())
                .unavailable(isUnavailableDay(slots))
                .slots(timeSlots)
                .build();
    }

    private List<DoctorAvailability> buildDefaultAvailability(Long doctorId, LocalDate date) {
        return DEFAULT_TIME_SLOTS.stream()
                .map(slot -> buildSlot(
                        doctorId,
                        date.getDayOfWeek().name(),
                        null,
                        slot.getStartTime(),
                        slot.getEndTime(),
                        DoctorAvailability.Status.AVAILABLE
                ))
                .toList();
    }

    private boolean isUnavailableDay(List<DoctorAvailability> slots) {
        return slots.stream()
                .noneMatch(slot -> slot.getStatus() == DoctorAvailability.Status.AVAILABLE
                        && slot.getStartTime() != null
                        && slot.getEndTime() != null);
    }

    private List<DoctorAvailability> filterAvailableSlots(List<DoctorAvailability> slots) {
        return slots.stream()
                .filter(slot -> slot.getStatus() == DoctorAvailability.Status.AVAILABLE)
                .filter(slot -> slot.getStartTime() != null && slot.getEndTime() != null)
                .toList();
    }

    private List<DoctorAvailability> sortSlots(List<DoctorAvailability> slots) {
        return slots.stream()
                .sorted(Comparator.comparing(DoctorAvailability::getStartTime))
                .toList();
    }

    private Set<String> normalizeDays(List<String> availableDays) {
        if (availableDays == null || availableDays.isEmpty()) {
            return new LinkedHashSet<>(ALL_DAYS);
        }

        LinkedHashSet<String> normalized = new LinkedHashSet<>();
        for (String day : availableDays) {
            validateDayOfWeek(day);
            normalized.add(day.trim().toUpperCase(Locale.ROOT));
        }
        return normalized;
    }

    private List<AvailabilityTimeSlotRequest> normalizeTimeSlotRequests(List<AvailabilityTimeSlotRequest> slots) {
        if (slots == null || slots.isEmpty()) {
            AvailabilityTimeSlotRequest defaultSlot = new AvailabilityTimeSlotRequest();
            defaultSlot.setStartTime(LocalTime.of(9, 0));
            defaultSlot.setEndTime(LocalTime.of(17, 0));
            return List.of(defaultSlot);
        }
        return slots;
    }

    private void authorizeDoctorAccess(Long doctorId, AuthenticatedUser user) {
        if (user.hasRole("ADMIN")) {
            return;
        }
        if (!user.hasRole("DOCTOR") || !doctorId.equals(user.userId())) {
            throw new AccessDeniedException("You can only manage your own availability.");
        }
    }

    private Long resolveDoctorId(Long requestedDoctorId, AuthenticatedUser user) {
        if (user.hasRole("DOCTOR")) {
            return user.userId();
        }
        if (user.hasRole("ADMIN") && requestedDoctorId != null) {
            return requestedDoctorId;
        }
        throw new AccessDeniedException("Only doctors or admins can manage availability.");
    }

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (startTime == null || endTime == null || !startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("End time must be after start time.");
        }
    }

    private void validateDayOfWeek(String dayOfWeek) {
        try {
            DayOfWeek.valueOf(dayOfWeek.trim().toUpperCase(Locale.ROOT));
        } catch (RuntimeException ex) {
            throw new IllegalArgumentException("Invalid day of week.");
        }
    }

    private int dayOrder(String dayOfWeek) {
        if (dayOfWeek == null) {
            return Integer.MAX_VALUE;
        }
        return ALL_DAYS.indexOf(dayOfWeek.toUpperCase(Locale.ROOT));
    }
}
