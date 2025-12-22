package melodia.model.dto.common;

import java.util.List;

/**
 * Pageable Response DTO
 * Digunakan untuk response dengan pagination
 */
public class PageableResponse<T> {
    private boolean success = true;
    private String message;
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrevious;
    private long timestamp;

    public PageableResponse() {
        this.timestamp = System.currentTimeMillis();
    }

    public PageableResponse(String message, List<T> content, int pageNumber, 
                           int pageSize, long totalElements, int totalPages) {
        this.message = message;
        this.content = content;
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.hasNext = pageNumber < totalPages - 1;
        this.hasPrevious = pageNumber > 0;
        this.timestamp = System.currentTimeMillis();
    }

    // Static factory method
    public static <T> PageableResponse<T> of(String message, List<T> content, 
                                             int pageNumber, int pageSize, 
                                             long totalElements, int totalPages) {
        return new PageableResponse<>(message, content, pageNumber, pageSize, totalElements, totalPages);
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

    public List<T> getContent() {
        return content;
    }

    public void setContent(List<T> content) {
        this.content = content;
    }

    public int getPageNumber() {
        return pageNumber;
    }

    public void setPageNumber(int pageNumber) {
        this.pageNumber = pageNumber;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public boolean isHasNext() {
        return hasNext;
    }

    public void setHasNext(boolean hasNext) {
        this.hasNext = hasNext;
    }

    public boolean isHasPrevious() {
        return hasPrevious;
    }

    public void setHasPrevious(boolean hasPrevious) {
        this.hasPrevious = hasPrevious;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
