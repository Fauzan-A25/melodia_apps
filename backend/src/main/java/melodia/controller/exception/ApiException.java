package melodia.controller.exception;

import org.springframework.http.HttpStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

/**
 * Base exception untuk semua custom exceptions
 * Bisa langsung di-serialize ke JSON response tanpa perlu ErrorResponse wrapper
 */
public abstract class ApiException extends RuntimeException {
    
    private final HttpStatus httpStatus;
    private final String errorCode;
    private final LocalDateTime timestamp;

    public ApiException(String message, HttpStatus httpStatus, String errorCode) {
        super(message);
        this.httpStatus = httpStatus;
        this.errorCode = errorCode;
        this.timestamp = LocalDateTime.now();
    }

    public ApiException(String message, Throwable cause, HttpStatus httpStatus, String errorCode) {
        super(message, cause);
        this.httpStatus = httpStatus;
        this.errorCode = errorCode;
        this.timestamp = LocalDateTime.now();
    }

    @JsonProperty("error")
    @Override
    public String getMessage() {
        return super.getMessage();
    }

    @JsonProperty("errorCode")
    public String getErrorCode() {
        return errorCode;
    }

    @JsonProperty("status")
    public int getStatus() {
        return httpStatus.value();
    }

    @JsonProperty("timestamp")
    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}
