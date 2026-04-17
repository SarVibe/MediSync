package com.healthcare.medicalrecords.medical_service.service;

import com.healthcare.medicalrecords.medical_service.dto.GetPrescriptionDto;
import com.healthcare.medicalrecords.medical_service.model.Prescription;
import com.healthcare.medicalrecords.medical_service.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PrescriptionService {
    private final PrescriptionRepository prescriptionRepository;
    @Value("${app.upload.base-dir:uploads}")
    private String uploadBaseDir;

    @Value("${app.upload.prescriptions-folder:prescriptions}")
    private String prescriptionsFolder;

    @Value("${app.upload.url-prefix:/uploads}")
    private String uploadUrlPrefix;

    public List<GetPrescriptionDto> getPrescriptionsByPatientId(Long patientId) {
        return prescriptionRepository.findByPatientId(patientId);
    }

    public List<GetPrescriptionDto> getPrescriptionsByDoctorId(Long doctorId) {
        return prescriptionRepository.findByDoctorId(doctorId);
    }

    public List<GetPrescriptionDto> getAllPrescriptions() {
        return prescriptionRepository.findAllByOrderByCreatedAtDesc();
    }

    public GetPrescriptionDto createPrescription(
            Long doctorId,
            Long patientId,
            Long appointmentId,
            LocalDate validUntil,
            MultipartFile image
    ) {
        if (image == null || image.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image is required");
        }

        String imageUrl = storePrescriptionImage(image);

        Prescription prescription = new Prescription();
        prescription.setPatientId(patientId);
        prescription.setDoctorId(doctorId);
        prescription.setAppointmentId(appointmentId);
        prescription.setPrescriptionUrl(imageUrl);
        prescription.setValidUntil(validUntil);
        prescriptionRepository.save(prescription);

        return new GetPrescriptionDto(
                prescription.getId(),
                prescription.getPatientId(),
                prescription.getDoctorId(),
                prescription.getAppointmentId(),
                prescription.getPrescriptionUrl(),
                prescription.getValidUntil(),
                prescription.getCreatedAt()
        );
    }

    public String deletePrescription(Long prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prescription not found"));

        deletePrescriptionFile(prescription.getPrescriptionUrl());
        prescriptionRepository.deleteById(prescriptionId);
        return "Prescription deleted successfully with id: " + prescriptionId;
    }

    private String storePrescriptionImage(MultipartFile image) {
        try {
            Path baseDirPath = Paths.get(uploadBaseDir).toAbsolutePath().normalize();
            String normalizedPrescriptionsFolder = normalizeFolderName(prescriptionsFolder);
            Path prescriptionDir = baseDirPath.resolve(normalizedPrescriptionsFolder).normalize();
            Files.createDirectories(prescriptionDir);

            String extension = getFileExtension(image.getOriginalFilename());
            String fileName = UUID.randomUUID() + extension;
            Path targetFile = prescriptionDir.resolve(fileName).normalize();

            if (!Objects.equals(targetFile.getParent(), prescriptionDir)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file path");
            }

            Files.copy(image.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);
            return uploadUrlPrefix + "/" + normalizedPrescriptionsFolder + "/" + fileName;
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store prescription image", exception);
        }
    }

    private void deletePrescriptionFile(String imageUrl) {
        try {
            String normalizedPrescriptionsFolder = normalizeFolderName(prescriptionsFolder);
            String expectedPrefix = uploadUrlPrefix + "/" + normalizedPrescriptionsFolder + "/";
            if (imageUrl == null || !imageUrl.startsWith(expectedPrefix)) {
                return;
            }

            String fileName = imageUrl.substring(expectedPrefix.length());
            if (fileName.isBlank()) {
                return;
            }

            Path filePath = Paths.get(uploadBaseDir)
                    .toAbsolutePath()
                    .normalize()
                    .resolve(normalizedPrescriptionsFolder)
                    .resolve(fileName)
                    .normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
            // Ignore file deletion failures and continue DB cleanup.
        }
    }

    private String normalizeFolderName(String folder) {
        if (folder == null) {
            return "";
        }

        String normalized = folder.trim();
        while (normalized.startsWith("/") || normalized.startsWith("\\")) {
            normalized = normalized.substring(1);
        }
        while (normalized.endsWith("/") || normalized.endsWith("\\")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }

    private String getFileExtension(String fileName) {
        if (fileName == null) {
            return "";
        }

        int extensionIndex = fileName.lastIndexOf('.');
        if (extensionIndex < 0 || extensionIndex == fileName.length() - 1) {
            return "";
        }

        return fileName.substring(extensionIndex);
    }
}