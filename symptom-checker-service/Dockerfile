# Build stage
FROM eclipse-temurin:25-jdk AS builder
WORKDIR /build

# Copy Maven wrapper and pom.xml first (for better caching)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies (this layer will be cached)
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source code and build
COPY src src
RUN ./mvnw clean package -DskipTests

# Run stage
FROM eclipse-temurin:25-jre
WORKDIR /app

# Copy the JAR file
COPY --from=builder /build/target/symptom-checker-service-*.jar app.jar

# Create a directory for configuration
RUN mkdir -p /app/config

# Copy application properties (optional - can also be overridden)
COPY --from=builder /build/src/main/resources/application.properties /app/config/application.properties

# Expose port
EXPOSE 8088

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]