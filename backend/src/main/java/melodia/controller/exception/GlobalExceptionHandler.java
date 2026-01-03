package melodia.controller.exception;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ==================== Handle All ApiException ====================

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> handleApiException(ApiException ex, WebRequest request) {
        // Ignore favicon requests
        if (isFaviconRequest(request)) {
            return ResponseEntity.notFound().build();
        }
        
        logException(ex);
        
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("error", ex.getMessage());
        response.put("errorCode", ex.getErrorCode());
        response.put("status", ex.getStatus());
        response.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity
            .status(ex.getHttpStatus())
            .body(response);
    }

    // ==================== Handle General Exceptions ====================

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex, WebRequest request) {
        if (isFaviconRequest(request)) {
            return ResponseEntity.notFound().build();
        }
        
        logger.warn("Validation error: {}", ex.getMessage());
        
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("error", "Validasi error: " + ex.getMessage());
        response.put("errorCode", "VALIDATION_ERROR");
        response.put("status", 400);
        response.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex, WebRequest request) {
        if (isFaviconRequest(request)) {
            return ResponseEntity.notFound().build();
        }
        
        logger.warn("Invalid state: {}", ex.getMessage());
        
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("error", "Invalid state: " + ex.getMessage());
        response.put("errorCode", "INVALID_STATE");
        response.put("status", 400);
        response.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.badRequest().body(response);
    }

    // ==================== Handle Database Constraint Violations ====================

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex, WebRequest request) {
        if (isFaviconRequest(request)) {
            return ResponseEntity.notFound().build();
        }
        
        logger.warn("Database constraint violation: {}", ex.getMessage());
        
        String errorMessage = "Database constraint violation";
        
        // Check for unique constraint violation
        if (ex.getMessage() != null && ex.getMessage().contains("Duplicate entry")) {
            errorMessage = "This value already exists. Please use a different value.";
        }
        // Check for null constraint violation
        else if (ex.getMessage() != null && ex.getMessage().contains("NOT NULL constraint failed")) {
            errorMessage = "Required field cannot be empty.";
        }
        
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("error", errorMessage);
        response.put("errorCode", "DATABASE_CONSTRAINT_VIOLATION");
        response.put("status", 409);
        response.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.status(409).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(Exception ex, WebRequest request) {
        if (isFaviconRequest(request)) {
            return ResponseEntity.notFound().build();
        }
        
        logger.error("Unexpected error: ", ex);
        
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("error", "Internal server error");
        response.put("errorCode", "INTERNAL_SERVER_ERROR");
        response.put("status", 500);
        response.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.status(500).body(response);
    }

    // ==================== Helper Methods ====================

    private void logException(ApiException ex) {
        int statusCode = ex.getHttpStatus().value();
        
        if (statusCode >= 500) {
            logger.error("[{}] {}", ex.getErrorCode(), ex.getMessage());
        } else if (statusCode >= 400) {
            logger.warn("[{}] {}", ex.getErrorCode(), ex.getMessage());
        } else {
            logger.info("[{}] {}", ex.getErrorCode(), ex.getMessage());
        }
    }

    private boolean isFaviconRequest(WebRequest request) {
        String path = request.getDescription(false);
        return path != null && path.contains("favicon.ico");
    }
}
