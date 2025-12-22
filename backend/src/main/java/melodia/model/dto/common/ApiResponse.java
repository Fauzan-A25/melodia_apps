package melodia.model.dto.common;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Generic API Response Wrapper
 * Digunakan untuk semua response API dengan format yang konsisten
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private long timestamp;

    /**
     * Constructor for success response with data
     */
    public ApiResponse(String message, T data) {
        this.success = true;
        this.message = message;
        this.data = data;
        this.timestamp = System.currentTimeMillis();
    }

    /**
     * Constructor for success response without data
     */
    public ApiResponse(String message) {
        this.success = true;
        this.message = message;
        this.data = null;
        this.timestamp = System.currentTimeMillis();
    }

    /**
     * Constructor for error response
     */
    public ApiResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
        this.data = null;
        this.timestamp = System.currentTimeMillis();
    }

    /**
     * Static factory for success response with data
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(message, data);
    }

    /**
     * Static factory for success response without data
     */
    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(message);
    }

    /**
     * Static factory for error response
     */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message);
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

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
