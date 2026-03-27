CREATE TABLE prescriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_id BIGINT NOT NULL,
    prescription_url VARCHAR(500) NOT NULL,
    valid_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);