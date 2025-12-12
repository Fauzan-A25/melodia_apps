package melodia.model.dto.request.auth;

public class RegisterAdminRequest {
    private String username;
    private String email;
    private String password;
    private String requestedByAdminId;

    // Constructors
    public RegisterAdminRequest() {}

    public RegisterAdminRequest(String username, String email, String password, String requestedByAdminId) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.requestedByAdminId = requestedByAdminId;
    }

    // Getters & Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRequestedByAdminId() { return requestedByAdminId; }
    public void setRequestedByAdminId(String requestedByAdminId) { 
        this.requestedByAdminId = requestedByAdminId; 
    }
}
