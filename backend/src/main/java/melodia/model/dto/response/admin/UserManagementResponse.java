package melodia.model.dto.response.admin;

public class UserManagementResponse {
    private String accountId;
    private String username;
    private String email;
    private String accountType;
    private boolean banned;
    private String banReason;
    private String createdAt;

    public UserManagementResponse() {
    }

    public UserManagementResponse(String accountId, String username, String email, String accountType, 
                                   boolean banned, String banReason, String createdAt) {
        this.accountId = accountId;
        this.username = username;
        this.email = email;
        this.accountType = accountType;
        this.banned = banned;
        this.banReason = banReason;
        this.createdAt = createdAt;
    }

    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public boolean isBanned() {
        return banned;
    }

    public void setBanned(boolean banned) {
        this.banned = banned;
    }

    public String getBanReason() {
        return banReason;
    }

    public void setBanReason(String banReason) {
        this.banReason = banReason;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
