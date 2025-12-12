package melodia.model.dto.response;

public class AuthResponse {
    private String message;
    private String accountId;
    private String username;
    private String email;
    private String accountType;
    private String token;
    private String bio;   // optional, hanya terisi untuk ARTIST

    public AuthResponse(String message, String accountId, String username,
                        String email, String accountType) {
        this.message = message;
        this.accountId = accountId;
        this.username = username;
        this.email = email;
        this.accountType = accountType;
    }

    // Constructor untuk ARTIST (dengan bio)
    public AuthResponse(String message, String accountId, String username,
                        String email, String accountType, String bio) {
        this(message, accountId, username, email, accountType);
        this.bio = bio;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getAccountId() { return accountId; }
    public void setAccountId(String accountId) { this.accountId = accountId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}
