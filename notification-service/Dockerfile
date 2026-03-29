FROM eclipse-temurin:25-jdk as builder
WORKDIR /build

# Step 1: Copy ONLY dependency configuration files first
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Step 2: Download dependencies (this layer is CACHED unless pom.xml changes)
RUN ./mvnw dependency:go-offline -B

# Step 3: Copy source code (only invalidates when source changes)
COPY src src

# Step 4: Build application
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:25-jre
WORKDIR /app

# Copy the built JAR
COPY --from=builder /build/target/healthcare-gateway-0.0.1-SNAPSHOT.jar app.jar

# Copy configuration (optional - you might not need this if using environment variables)
COPY ./src/main/resources/application.properties /app/config/application.properties

# Spring Boot will automatically find application.properties in config/
# You don't need SPRING_CONFIG_LOCATION for default locations
# But keep it if you want explicit control
ENV SPRING_CONFIG_LOCATION=/app/config/application.properties

ENTRYPOINT ["java", "-jar", "app.jar"]