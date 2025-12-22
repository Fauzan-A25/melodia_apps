package melodia.model.dto.response.admin;

public class UserManagementResponse {

    private final String accountId;
    private final String username;
    private final String email;
    private final String accountType;
    private final boolean banned;
    private final String banReason;
    private final String createdAt;

    public UserManagementResponse(
            String accountId,
            String username,
            String email,
            String accountType,
            boolean banned,
            String banReason,
            String createdAt
    ) {
        this.accountId = accountId;
        this.username = username;
        this.email = email;
        this.accountType = accountType;
        this.banned = banned;
        this.banReason = banReason;
        this.createdAt = createdAt;
    }

    public String getAccountId() { return accountId; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getAccountType() { return accountType; }
    public boolean isBanned() { return banned; }
    public boolean getBanned() { return banned; } // untuk JSON field "banned"
    public String getBanReason() { return banReason; }
    public String getCreatedAt() { return createdAt; }
}
