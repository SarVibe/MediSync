FROM eclipse-temurin:25-jdk as builder
WORKDIR /build
COPY . .
RUN ./mvnw clean package -DskipTests
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=builder /build/target/medical-service-0.0.1-SNAPSHOT.jar app.jar
COPY ./src/main/resources/application.properties /app/config/application.properties
ENV SPRING_CONFIG_LOCATION=/app/config/application.properties
ENTRYPOINT ["java", "-jar", "app.jar"]