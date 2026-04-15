package com.healthcare.gateway.healthcare_gateway.routes;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.server.mvc.filter.CircuitBreakerFilterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.function.RequestPredicates;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerRequest;
import org.springframework.web.servlet.function.ServerResponse;

import java.net.URI;
import java.util.function.Function;

import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.uri;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;

@Configuration
public class Routes {

        private static final Logger log = LoggerFactory.getLogger(Routes.class);

        @Value("${medical.service.url:http://localhost:8081}")
        private String medicalServiceUrl;

        @Value("${notification.service.url:http://localhost:8082}")
        private String notificationServiceUrl;

        @Value("${profile.service.url:http://localhost:8083}")
        private String profileServiceUrl;

        @Value("${auth.service.url:http://localhost:8086}")
        private String authServiceUrl;

        @Value("${appointment.service.url:http://localhost:8084}")
        private String appointmentServiceUrl;

        @Value("${payment.service.url:http://localhost:8085}")
        private String paymentServiceUrl;

        @Value("${symptom-checker.service.url:http://localhost:8080}")
        private String symptomCheckerServiceUrl;

        @Value("${telemedicine.service.url:http://localhost:8087}")
        private String telemedicineServiceUrl;

        /**
         * Reusable filter to forward Authorization header
         * and log full incoming + forwarding URL
         */
        private Function<ServerRequest, ServerRequest> forwardAndLogRequest(String targetBaseUrl) {
                return request -> {
                        String authHeader = request.headers().asHttpHeaders().getFirst("Authorization");

                        String originalUrl = request.uri().toString();
                        String path = request.uri().getPath();
                        String query = request.uri().getQuery();

                        String fullTargetUrl = targetBaseUrl + path;

                        if (query != null && !query.isEmpty()) {
                                fullTargetUrl += "?" + query;
                        }

                        log.info("==================================================");
                        log.info("Incoming Request Received");
                        log.info("Method          : {}", request.method());
                        log.info("Original URL    : {}", originalUrl);
                        log.info("Request Path    : {}", path);
                        log.info("Forwarding To   : {}", fullTargetUrl);
                        log.info("Target Base URL : {}", targetBaseUrl);
                        log.info("Auth Header     : {}", authHeader != null ? "Present" : "Missing");
                        log.info("==================================================");

                        ServerRequest.Builder builder = ServerRequest.from(request);

                        if (authHeader != null && !authHeader.isEmpty()) {
                                builder.header("Authorization", authHeader);
                                log.info("Authorization header forwarded successfully");
                        }

                        return builder.build();
                };
        }

        @Bean
        public RouterFunction<ServerResponse> preflightRoute() {
                return route("cors_preflight")
                                .route(RequestPredicates.method(HttpMethod.OPTIONS),
                                                request -> ServerResponse.ok().build())
                                .build();
        }

        @Bean
        public RouterFunction<ServerResponse> prescriptionServiceRoute() {
                return route("prescription_service")
                                .route(RequestPredicates.path("/api/prescriptions/**"), HandlerFunctions.http())
                                .before(forwardAndLogRequest(medicalServiceUrl))
                                .before(uri(medicalServiceUrl))
                                .filter(CircuitBreakerFilterFunctions.circuitBreaker(
                                                "prescriptionServiceCircuitBreaker",
                                                URI.create("forward:/fallbackRoute")))
                                .build();
        }

        @Bean
        public RouterFunction<ServerResponse> medicalServiceRoute() {
                return route("medical_service")
                                .route(RequestPredicates.path("/api/medical-records/**"), HandlerFunctions.http())
                                .before(forwardAndLogRequest(medicalServiceUrl))
                                .before(uri(medicalServiceUrl))
                                .filter(CircuitBreakerFilterFunctions.circuitBreaker(
                                                "medicalServiceCircuitBreaker",
                                                URI.create("forward:/fallbackRoute")))
                                .build();
        }

        @Bean
        public RouterFunction<ServerResponse> authServiceRoute() {
                return route("auth_service")
                                .route(RequestPredicates.path("/auth/**"), HandlerFunctions.http())
                                .before(forwardAndLogRequest(authServiceUrl))
                                .before(uri(authServiceUrl))
                                .filter(CircuitBreakerFilterFunctions.circuitBreaker(
                                                "authServiceCircuitBreaker",
                                                URI.create("forward:/fallbackRoute")))
                                .build();
        }

        @Bean
        public RouterFunction<ServerResponse> profileServiceRoute() {
                return route("profile_service")
                                .route(RequestPredicates.path("/api/profiles/**"), HandlerFunctions.http())
                                .before(forwardAndLogRequest(profileServiceUrl))
                                .before(uri(profileServiceUrl))
                                .filter(CircuitBreakerFilterFunctions.circuitBreaker(
                                                "profileServiceCircuitBreaker",
                                                URI.create("forward:/fallbackRoute")))
                                .build();
        }

        @Bean
        public RouterFunction<ServerResponse> doctorProfileServiceRoute() {
                return route("doctor_profile_service")
                                .route(RequestPredicates.path("/api/doctor-upgrade/**"), HandlerFunctions.http())
                                .before(forwardAndLogRequest(profileServiceUrl))
                                .before(uri(profileServiceUrl))
                                .filter(CircuitBreakerFilterFunctions.circuitBreaker(
                                                "doctorProfileServiceCircuitBreaker",
                                                URI.create("forward:/fallbackRoute")))
                                .build();
        }

        @Bean
        public RouterFunction<ServerResponse> notificationServiceRoute() {
                return route("notification_service")
                                .route(RequestPredicates.path("/api/notifications/**"), HandlerFunctions.http())
                                .before(forwardAndLogRequest(notificationServiceUrl))
                                .before(uri(notificationServiceUrl))
                                .filter(CircuitBreakerFilterFunctions.circuitBreaker(
                                                "notificationServiceCircuitBreaker",
                                                URI.create("forward:/fallbackRoute")))
                                .build();
        }

        @Bean
        public RouterFunction<ServerResponse> appointmentServiceRoute() {
                return route("appointment_service")
                                .route(RequestPredicates.path("/api/appointments/**"), HandlerFunctions.http())
                                .before(forwardAndLogRequest(appointmentServiceUrl))
                                .before(uri(appointmentServiceUrl))
                                .filter(CircuitBreakerFilterFunctions.circuitBreaker(
                                                "appointmentServiceCircuitBreaker",
                                                URI.create("forward:/fallbackRoute")))
                                .build();
        }

        @Bean
        public RouterFunction<ServerResponse> doctorAvailabilityServiceRoute() {
                return route("doctor_availability_service")
                                .route(RequestPredicates.path("/api/doctors/**"), HandlerFunctions.http())
                                .before(forwardAndLogRequest(appointmentServiceUrl))
                                .before(uri(appointmentServiceUrl))
                                .filter(CircuitBreakerFilterFunctions.circuitBreaker(
                                                "doctorAvailabilityServiceCircuitBreaker",
                                                URI.create("forward:/fallbackRoute")))
                                .build();
        }

        @Bean
        public RouterFunction<ServerResponse> paymentServiceRoute() {
                return route("payment_service")
                                .route(RequestPredicates.path("/api/payments/**"), HandlerFunctions.http())
                                .before(forwardAndLogRequest(paymentServiceUrl))
                                .before(uri(paymentServiceUrl))
                                .build();
        }

        @Bean
        public RouterFunction<ServerResponse> symptomCheckerServiceRoute() {
                return route("symptom_checker_service")
                                .route(RequestPredicates.path("/api/symptom-checker/**"), HandlerFunctions.http())
                                .before(forwardAndLogRequest(symptomCheckerServiceUrl))
                                .before(uri(symptomCheckerServiceUrl))
                                .filter(CircuitBreakerFilterFunctions.circuitBreaker(
                                                "symptomCheckerServiceCircuitBreaker",
                                                URI.create("forward:/fallbackRoute")))
                                .build();
        }

        @Bean
        public RouterFunction<ServerResponse> telemedicineServiceRoute() {
                return route("telemedicine_service")
                                .route(RequestPredicates.path("/api/video-sessions/**"), HandlerFunctions.http())
                                .before(forwardAndLogRequest(telemedicineServiceUrl))
                                .before(uri(telemedicineServiceUrl))
                                .filter(CircuitBreakerFilterFunctions.circuitBreaker(
                                                "telemedicineServiceCircuitBreaker",
                                                URI.create("forward:/fallbackRoute")))
                                .build();
        }

        @Bean
        public RouterFunction<ServerResponse> fallbackRoute() {
                return route("fallbackRoute")
                                .route(RequestPredicates.all(), request -> {
                                        log.error("Fallback route triggered for path: {}", request.uri());
                                        return ServerResponse.status(HttpStatus.SERVICE_UNAVAILABLE)
                                                        .body("Service Unavailable, please try again later");
                                })
                                .build();
        }
}