package com.healthcare.medicalrecords.medical_service.service;

import com.healthcare.medicalrecords.medical_service.dto.GetMedicalRecordDto;
import com.healthcare.medicalrecords.medical_service.model.MedicalRecords;
import com.healthcare.medicalrecords.medical_service.repository.MedicalRepository;
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
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MedicalRecordService {
    private final MedicalRepository medicalRepository;
    @Value("${app.upload.base-dir:uploads}")
    private String uploadBaseDir;

    @Value("${app.upload.medical-records-folder:medical-records}")
    private String medicalDocumentFolder;

    @Value("${app.upload.url-prefix:/uploads}")
    private String uploadUrlPrefix;

    public List<GetMedicalRecordDto> getMedicalRecord(Long patientId) {
        return medicalRepository.findAllByPatientId(patientId);
    }

    public GetMedicalRecordDto createMedicalRecord(
            Long patientId,
            MultipartFile medicalDocument,
            String recordType,
            String description
    ) {
        if (medicalDocument == null || medicalDocument.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image is required");
        }

        String documentUrl = storeMedicalDocument(medicalDocument);

        MedicalRecords medicalRecords = new MedicalRecords();
        medicalRecords.setPatientId(patientId);
        medicalRecords.setFileUrl(documentUrl);
        medicalRecords.setRecordType(recordType);
        medicalRecords.setDescription(description);
        medicalRepository.save(medicalRecords);

        return new GetMedicalRecordDto(
                medicalRecords.getId(),
                medicalRecords.getPatientId(),
                medicalRecords.getFileUrl(),
                medicalRecords.getRecordType(),
                medicalRecords.getDescription(),
                medicalRecords.getCreatedAt()
        );
    }

    private String storeMedicalDocument(MultipartFile file) {
        try {
            Path baseDirPath = Paths.get(uploadBaseDir).toAbsolutePath().normalize();
            String normalizedMedicalDocumentFolder = normalizeFolderName(medicalDocumentFolder);
            Path medicalRecordDir = baseDirPath.resolve(normalizedMedicalDocumentFolder).normalize();
            Files.createDirectories(medicalRecordDir);

            String extension = getFileExtension(file.getOriginalFilename());
            String fileName = UUID.randomUUID() + extension;
            Path targetFile = medicalRecordDir.resolve(fileName).normalize();

            if (!Objects.equals(targetFile.getParent(), medicalRecordDir)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file path");
            }

            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);
            return uploadUrlPrefix + "/" + normalizedMedicalDocumentFolder + "/" + fileName;
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store Medical Document", exception);
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

    public String deleteMedicalRecord(Long medicalRecordId) {
        MedicalRecords medicalRecords = medicalRepository.findById(medicalRecordId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Medical record not found"));

        deleteMedicalDocumentFile(medicalRecords.getFileUrl());
        medicalRepository.deleteById(medicalRecordId);
        return "Medical record deleted successfully with id: " + medicalRecordId;
    }

    private void deleteMedicalDocumentFile(String imageUrl) {
        try {
            String normalizedMedicalDocumentFolder = normalizeFolderName(medicalDocumentFolder);
            String expectedPrefix = uploadUrlPrefix + "/" + normalizedMedicalDocumentFolder + "/";
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
                    .resolve(normalizedMedicalDocumentFolder)
                    .resolve(fileName)
                    .normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
            // Ignore file deletion failures and continue DB cleanup.
        }
    }
}
