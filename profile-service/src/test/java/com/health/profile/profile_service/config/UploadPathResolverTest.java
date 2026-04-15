package com.health.profile.profile_service.config;

import org.junit.jupiter.api.Test;

import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UploadPathResolverTest {

    private final UploadPathResolver resolver = new UploadPathResolver();

    @Test
    void shouldResolveRelativeUploadsInsideProfileServiceDirectory() {
        Path resolved = resolver.resolve("uploads");

        assertEquals("uploads", resolved.getFileName().toString());
        assertTrue(resolved.toString().replace('\\', '/').contains("/profile-service/uploads"));
    }

    @Test
    void shouldLeaveAbsoluteUploadPathUnchanged() {
        Path absolutePath = Path.of(System.getProperty("java.io.tmpdir"), "profile-service-test-uploads")
                .toAbsolutePath()
                .normalize();

        assertEquals(absolutePath, resolver.resolve(absolutePath.toString()));
    }
}
