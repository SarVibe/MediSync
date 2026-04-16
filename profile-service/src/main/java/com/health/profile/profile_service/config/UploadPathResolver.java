package com.health.profile.profile_service.config;

import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
public class UploadPathResolver {

    private static final String SERVICE_DIRECTORY_NAME = "profile-service";

    public Path resolve(String configuredUploadDir) {
        Path configuredPath = Path.of(configuredUploadDir).normalize();
        if (configuredPath.isAbsolute()) {
            return configuredPath;
        }

        Path serviceRoot = detectServiceRoot();
        return serviceRoot.resolve(configuredPath).normalize();
    }

    private Path detectServiceRoot() {
        Path codeSourcePath = getCodeSourcePath();
        Path current = Files.isRegularFile(codeSourcePath) ? codeSourcePath.getParent() : codeSourcePath;

        while (current != null) {
            if (SERVICE_DIRECTORY_NAME.equalsIgnoreCase(current.getFileName() != null ? current.getFileName().toString() : "")
                    || Files.exists(current.resolve("pom.xml"))) {
                return current;
            }
            current = current.getParent();
        }

        return Paths.get(System.getProperty("user.dir")).toAbsolutePath().normalize();
    }

    private Path getCodeSourcePath() {
        try {
            URI location = UploadPathResolver.class
                    .getProtectionDomain()
                    .getCodeSource()
                    .getLocation()
                    .toURI();
            return Path.of(location).toAbsolutePath().normalize();
        } catch (URISyntaxException ex) {
            return Paths.get(System.getProperty("user.dir")).toAbsolutePath().normalize();
        }
    }
}
