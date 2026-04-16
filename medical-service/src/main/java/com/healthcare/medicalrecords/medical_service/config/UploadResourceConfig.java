package com.healthcare.medicalrecords.medical_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class UploadResourceConfig implements WebMvcConfigurer {

    @Value("${app.upload.base-dir:uploads}")
    private String uploadBaseDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path baseDirPath = Paths.get(uploadBaseDir).toAbsolutePath().normalize();
        String uploadLocation = baseDirPath.toUri().toString();

        registry.addResourceHandler("/medical-service/uploads/**")
                .addResourceLocations(uploadLocation);
    }
}