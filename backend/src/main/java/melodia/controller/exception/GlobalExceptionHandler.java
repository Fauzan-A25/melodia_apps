package melodia.controller.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Global Exception Handler untuk handle semua custom exception
 * Langsung serialize ApiException ke JSON response
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ==================== Handle All ApiException ====================

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> handleApiException(ApiException ex) {
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
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        logger.warn("Validation error: {}", ex.getMessage());
        
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("error", "Validasi error: " + ex.getMessage());
        response.put("errorCode", "VALIDATION_ERROR");
        response.put("status", 400);
        response.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex) {
        logger.warn("Invalid state: {}", ex.getMessage());
        
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("error", "Invalid state: " + ex.getMessage());
        response.put("errorCode", "INVALID_STATE");
        response.put("status", 400);
        response.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(Exception ex) {
        logger.error("Unexpected error: ", ex);
        
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("error", "Internal server error");
        response.put("errorCode", "INTERNAL_SERVER_ERROR");
        response.put("status", 500);
        response.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.status(500).body(response);
    }

    // ==================== Helper Method ====================

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
}
