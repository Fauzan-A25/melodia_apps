package melodia.model.dto.request.admin;

import jakarta.validation.constraints.NotBlank;

public class BanUserRequest {
    @NotBlank(message = "Ban reason is required")
    private String reason;

    public BanUserRequest() {}

    public String getReason() { 
        return reason; 
    }
    
    public void setReason(String reason) { 
        this.reason = reason; 
    }
}
