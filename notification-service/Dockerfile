# Build stage
FROM eclipse-temurin:25-jdk AS builder
WORKDIR /build

COPY pom.xml mvnw ./
COPY .mvn .mvn

# Download dependencies
RUN ./mvnw -B -Dmaven.test.skip=true dependency:resolve dependency:resolve-plugins

# Copy source and build
COPY src src
RUN ./mvnw -B -Dmaven.test.skip=true clean package

# Runtime stage
FROM eclipse-temurin:25-jre
WORKDIR /app

# Copy built jar
COPY --from=builder /build/target/notification-service-0.0.1-SNAPSHOT.jar app.jar

# Config
COPY ./src/main/resources/application.properties ./config/application.properties
ENV SPRING_CONFIG_LOCATION=/app/config/application.properties

# Run
ENTRYPOINT ["java", "-jar", "app.jar"]