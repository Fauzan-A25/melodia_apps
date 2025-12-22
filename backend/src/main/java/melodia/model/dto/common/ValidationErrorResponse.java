package melodia.model.dto.common;

import java.util.HashMap;
import java.util.Map;

/**
 * Validation Error Response DTO
 * Digunakan untuk field-level validation errors
 */
public class ValidationErrorResponse {
    private boolean success = false;
    private String message = "Validation failed";
    private Map<String, String> errors = new HashMap<>();
    private long timestamp;

    public ValidationErrorResponse() {
        this.timestamp = System.currentTimeMillis();
    }

    public ValidationErrorResponse(String message) {
        this.message = message;
        this.timestamp = System.currentTimeMillis();
    }

    public ValidationErrorResponse addError(String field, String error) {
        this.errors.put(field, error);
        return this;
    }

    // Static factory method
    public static ValidationErrorResponse of(String message) {
        return new ValidationErrorResponse(message);
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Map<String, String> getErrors() {
        return errors;
    }

    public void setErrors(Map<String, String> errors) {
        this.errors = errors;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
