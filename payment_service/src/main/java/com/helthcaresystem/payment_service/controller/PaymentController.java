package com.helthcaresystem.payment_service.controller;

import com.helthcaresystem.payment_service.dto.CheckoutSessionResponse;
import com.helthcaresystem.payment_service.dto.ConfirmCheckoutRequest;
import com.helthcaresystem.payment_service.dto.CreateCheckoutSessionRequest;
import com.helthcaresystem.payment_service.dto.PaymentConfigResponse;
import com.helthcaresystem.payment_service.dto.PaymentTransactionResponse;
import com.helthcaresystem.payment_service.dto.UpdatePaymentConfigRequest;
import com.helthcaresystem.payment_service.security.AuthenticatedUser;
import com.helthcaresystem.payment_service.service.PaymentService;
import com.stripe.exception.StripeException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/config")
    public ResponseEntity<PaymentConfigResponse> getPaymentConfig() {
        return ResponseEntity.ok(paymentService.getPaymentConfig());
    }

    @PutMapping("/config")
    public ResponseEntity<PaymentConfigResponse> updatePaymentConfig(@Valid @RequestBody UpdatePaymentConfigRequest request,
                                                                    @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(paymentService.updatePaymentConfig(request, user));
    }

    @PostMapping("/checkout-session")
    public ResponseEntity<CheckoutSessionResponse> createCheckoutSession(@Valid @RequestBody CreateCheckoutSessionRequest request,
                                                                         @AuthenticationPrincipal AuthenticatedUser user,
                                                                         HttpServletRequest servletRequest) throws StripeException {
        return ResponseEntity.ok(paymentService.createCheckoutSession(
                request,
                user,
                servletRequest.getHeader("Authorization")
        ));
    }

    @PostMapping("/confirm-checkout")
    public ResponseEntity<PaymentTransactionResponse> confirmCheckout(@Valid @RequestBody ConfirmCheckoutRequest request,
                                                                      @AuthenticationPrincipal AuthenticatedUser user,
                                                                      HttpServletRequest servletRequest) throws StripeException {
        return ResponseEntity.ok(paymentService.confirmCheckout(
                request,
                user,
                servletRequest.getHeader("Authorization")
        ));
    }

    @PostMapping("/cancel-checkout")
    public ResponseEntity<PaymentTransactionResponse> cancelCheckout(@Valid @RequestBody ConfirmCheckoutRequest request,
                                                                     @AuthenticationPrincipal AuthenticatedUser user,
                                                                     HttpServletRequest servletRequest) {
        return ResponseEntity.ok(paymentService.cancelCheckout(
                request,
                user,
                servletRequest.getHeader("Authorization")
        ));
    }

    @GetMapping
    public ResponseEntity<List<PaymentTransactionResponse>> getTransactions(@RequestParam(required = false) String status,
                                                                            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(paymentService.getTransactions(status, user));
    }

    @PostMapping("/refunds/appointments/{appointmentId}/auto")
    public ResponseEntity<Void> triggerAutoRefundForAppointment(@PathVariable Long appointmentId,
                                                                @RequestParam(required = false) String paymentSessionId,
                                                                @AuthenticationPrincipal AuthenticatedUser user) throws StripeException {
        paymentService.triggerAutoRefundForAppointment(appointmentId, paymentSessionId, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{transactionId}/refund")
    public ResponseEntity<PaymentTransactionResponse> refundTransactionManually(@PathVariable Long transactionId,
                                                                                @AuthenticationPrincipal AuthenticatedUser user) throws StripeException {
        return ResponseEntity.ok(paymentService.refundTransactionManually(transactionId, user));
    }
}
