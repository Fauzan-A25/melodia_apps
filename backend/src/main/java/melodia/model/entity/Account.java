package melodia.model.entity;

import java.time.LocalDateTime;

import org.mindrot.jbcrypt.BCrypt;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.DiscriminatorType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "accounts")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "account_type", discriminatorType = DiscriminatorType.STRING)
public abstract class Account {
    
    @Id
    @Column(name = "account_id", length = 50, nullable = false)
    private String accountId;

    @Column(name = "username", length = 50, unique = true, nullable = false)
    private String username;

    @Column(name = "email", length = 100, unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", length = 255, nullable = false)
    private String passwordHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ✅ Tambahan untuk ban system
    @Column(name = "is_banned", nullable = false)
    private boolean banned = false;

    @Column(name = "ban_reason", length = 500)
    private String banReason;

    // ==================== Constructors ====================

    public Account(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.passwordHash = BCrypt.hashpw(password, BCrypt.gensalt());
        this.createdAt = LocalDateTime.now();
    }

    protected Account() {
        this.createdAt = LocalDateTime.now();
    }

    // ==================== Getters ====================

    public String getAccountId() { return accountId; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getPasswordHash() { return this.passwordHash; }

    public boolean isBanned() { return banned; }
    public boolean getBanned() { return banned; }   // untuk JSON field "banned"
    public String getBanReason() { return banReason; }

    // ==================== Setters ====================

    public void setAccountId(String accountId) { this.accountId = accountId; }
    public void setUsername(String username) { this.username = username; }
    public void setEmail(String email) { this.email = email; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public void setBanned(boolean banned) { this.banned = banned; }
    public void setBanReason(String banReason) { this.banReason = banReason; }

    public void updatePassword(String newPlaintextPassword) {
        this.passwordHash = BCrypt.hashpw(newPlaintextPassword, BCrypt.gensalt());
    }

    public boolean verifyPassword(String plaintextPassword) {
        return BCrypt.checkpw(plaintextPassword, this.passwordHash);
    }

    public abstract void displayDashboard();
    public abstract String getAccountType();

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
    
    @Override
    public String toString() {
        return "Account{" +
                "accountId='" + accountId + '\'' +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", createdAt=" + createdAt +
                ", type=" + getAccountType() +
                '}';
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Account)) return false;
        Account account = (Account) o;
        return accountId != null && accountId.equals(account.accountId);
    }
    
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
