package com.healthcare.gateway.healthcare_gateway.routes;

import org.springframework.cloud.gateway.server.mvc.filter.CircuitBreakerFilterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.function.RequestPredicates;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import java.net.URI;

import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.uri;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;

@Configuration
public class Routes {

    @Bean
    public RouterFunction<ServerResponse> prescriptionServiceRoute() {
        return route("prescription_service")
                .route(RequestPredicates.path("/api/prescriptions/**"), HandlerFunctions.http())
                .before(uri("http://localhost:8081"))
                .filter(CircuitBreakerFilterFunctions.circuitBreaker("medicalRecordServiceCircuitBreaker",
                        URI.create("forward:/fallbackRoute")))
                .build();

    }

    @Bean
    public RouterFunction<ServerResponse> orderServiceRoute() {
        return route("payment_service")
                .route(RequestPredicates.path("/api/payments"), HandlerFunctions.http())
                .before(uri("http://localhost:8081"))
                .filter(CircuitBreakerFilterFunctions.circuitBreaker("paymentServiceCircuitBreaker",
                        URI.create("forward:/fallbackRoute")))
                .build();

    }

    @Bean
    public RouterFunction<ServerResponse> medicalServiceRoute() {
        return route("medical_service")
                .route(RequestPredicates.path("/api/medical_records"), HandlerFunctions.http())
                .before(uri("http://localhost:8081"))
                .filter(CircuitBreakerFilterFunctions.circuitBreaker("paymentServiceCircuitBreaker",
                        URI.create("forward:/fallbackRoute")))
                .build();

    }


    @Bean
    public RouterFunction<ServerResponse> fallbackRoute() {
        return route("fallbackRoute")
                .route(RequestPredicates.all(), request ->
                        ServerResponse.status(HttpStatus.SERVICE_UNAVAILABLE)
                                .body("Service Unavailable, please try again later"))
                .build();
    }
}
