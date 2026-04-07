package com.health.profile.profile_service.service;

import com.health.profile.profile_service.exception.ProfileException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriUtils;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileImageStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/png");
    private static final long MAX_FILE_SIZE_BYTES = 2L * 1024 * 1024;

    @Value("${app.upload.dir:${user.dir}/uploads}")
    private String uploadDir;

    @Value("${app.upload.public-base-url:http://localhost:8083}")
    private String publicBaseUrl;

    private Path uploadPath;

    @PostConstruct
    void init() {
        uploadPath = Path.of(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException ex) {
            throw new ProfileException("Unable to initialize upload directory.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public String storeDoctorProfileImage(MultipartFile file) {
        validateImage(file);

        String originalFilename = file.getOriginalFilename();
        String filename = UUID.randomUUID() + "." + extractExtension(originalFilename == null ? "" : originalFilename);
        Path destination = uploadPath.resolve(filename).normalize();

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new ProfileException("Failed to store uploaded image.", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return normalizeBaseUrl(publicBaseUrl) + "/uploads/" + UriUtils.encodePathSegment(filename, java.nio.charset.StandardCharsets.UTF_8);
    }

    public String storePatientProfileImage(MultipartFile file) {
        return storeDoctorProfileImage(file);
    }

    public void deleteManagedProfileImage(String imageUrl) {
        Path managedFilePath = resolveManagedUploadPath(imageUrl);
        if (managedFilePath == null) {
            return;
        }

        try {
            Files.deleteIfExists(managedFilePath);
        } catch (IOException ex) {
            throw new ProfileException("Failed to delete profile image.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ProfileException("Profile image is required.", HttpStatus.BAD_REQUEST);
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new ProfileException("Profile image must not exceed 2 MB.", HttpStatusCode.valueOf(413));
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new ProfileException("Profile image must have a valid filename.", HttpStatus.BAD_REQUEST);
        }

        String extension = extractExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new ProfileException("Only JPG, JPEG, and PNG images are allowed.", HttpStatus.BAD_REQUEST);
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new ProfileException("Only JPG, JPEG, and PNG images are allowed.", HttpStatus.BAD_REQUEST);
        }
    }

    private String extractExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == filename.length() - 1) {
            throw new ProfileException("Profile image must include a file extension.", HttpStatus.BAD_REQUEST);
        }
        return filename.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
    }

    private String normalizeBaseUrl(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private Path resolveManagedUploadPath(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return null;
        }

        String normalizedBaseUrl = normalizeBaseUrl(publicBaseUrl);
        String encodedFileName;
        if (imageUrl.startsWith(normalizedBaseUrl + "/uploads/")) {
            encodedFileName = imageUrl.substring((normalizedBaseUrl + "/uploads/").length());
        } else if (imageUrl.startsWith("/uploads/")) {
            encodedFileName = imageUrl.substring("/uploads/".length());
        } else {
            try {
                URI uri = new URI(imageUrl);
                String path = uri.getPath();
                if (path == null || !path.startsWith("/uploads/")) {
                    return null;
                }
                encodedFileName = path.substring("/uploads/".length());
            } catch (URISyntaxException ex) {
                return null;
            }
        }

        String fileName = UriUtils.decode(encodedFileName, java.nio.charset.StandardCharsets.UTF_8);
        if (fileName.contains("/") || fileName.contains("\\") || fileName.contains("..")) {
            return null;
        }

        Path candidate = uploadPath.resolve(fileName).normalize();
        return candidate.startsWith(uploadPath) ? candidate : null;
    }
}


