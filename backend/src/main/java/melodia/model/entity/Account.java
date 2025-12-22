package melodia.model.entity;

import java.time.LocalDateTime;

import org.mindrot.jbcrypt.BCrypt; // * jBCrypt: hashing password dengan bcrypt (salt unik per akun)

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.DiscriminatorType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

//! Entity dasar untuk semua akun yang bisa LOGIN ke Melodia.
//* Hanya dua tipe: USER (pendengar) dan ADMIN (pengelola sistem).
@Entity
@Table(name = "accounts")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE) // * Admin & User disimpan di satu tabel (single-table inheritance).
@DiscriminatorColumn(
        name = "account_type",
        discriminatorType = DiscriminatorType.STRING
) // * Kolom "account_type" akan berisi "ADMIN" atau "USER" tergantung subclass-nya.
public abstract class Account {

    // ==================== Identitas utama ====================

    @Id
    @Column(name = "account_id", length = 50, nullable = false)
    private String accountId; //! ID unik akun (prefix USR... / ADM..); di-generate di service supaya tidak bentrok di DB.

    @Column(name = "username", length = 50, unique = true, nullable = false)
    private String username;  // * Username dipakai untuk login dan tampil di UI.

    @Column(name = "email", length = 100, unique = true, nullable = false)
    private String email;     // * Email untuk verifikasi (akan tetapi sekarang hanya formalitas), dan reset password.

    // ==================== Keamanan & audit ====================

    @Column(name = "password_hash", length = 255, nullable = false)
    private String passwordHash; // * Menyimpan HASH bcrypt, bukan password asli (plaintext).

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // * Waktu ketika akun pertama kali dibuat.

    // ==================== Ban system ====================

    @Column(name = "is_banned", nullable = false)
    private boolean banned = false; //! Jika true, akun tidak boleh login / memakai fitur proteksi.

    @Column(name = "ban_reason", length = 500)
    private String banReason; // * Menjelaskan alasan ban (spam, abuse, pelanggaran hak cipta, dsb.).

    // ==================== Constructors ====================

    // * Dipakai saat proses registrasi akun baru (user biasa atau admin).
    public Account(String username, String email, String password) {
        this.username = username;
        this.email = email;
        // ! Selalu hash password sebelum disimpan.
        this.passwordHash = BCrypt.hashpw(password, BCrypt.gensalt());
        this.createdAt = LocalDateTime.now();
    }

    // * Diperlukan oleh JPA. Dibiarkan protected agar tidak dipakai sembarangan.
    protected Account() {
        this.createdAt = LocalDateTime.now();
    }

    // ==================== Getters ====================

    public String getAccountId() { return accountId; }
    public String getUsername()  { return username; }
    public String getEmail()     { return email; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getPasswordHash()     { return this.passwordHash; }

    public boolean isBanned()   { return banned; }
    public boolean getBanned()  { return banned; } // * Method tambahan untuk mempermudah serialisasi JSON.
    public String getBanReason(){ return banReason; }

    // ==================== Setters (tanpa komentar yang sudah jelas) ====================

    public void setAccountId(String accountId) { this.accountId = accountId; }
    public void setUsername(String username)   { this.username = username; }
    public void setEmail(String email)         { this.email = email; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setPasswordHash(String passwordHash)  { this.passwordHash = passwordHash; }
    public void setBanned(boolean banned)      { this.banned = banned; }
    public void setBanReason(String banReason) { this.banReason = banReason; }

    // ==================== Password logic ====================

    //! Gunakan method ini setiap kali mengganti password agar selalu melewati proses hashing.
    public void updatePassword(String newPlaintextPassword) {
        // ! Jangan pernah di-log atau dikirim ke response.
        this.passwordHash = BCrypt.hashpw(newPlaintextPassword, BCrypt.gensalt());
    }

    // * Dipakai saat login untuk mengecek apakah password input cocok dengan hash di DB.
    public boolean verifyPassword(String plaintextPassword) {
        return BCrypt.checkpw(plaintextPassword, this.passwordHash);
    }

    // ==================== Kontrak subclass ====================

    // * Mengembalikan jenis akun ("ADMIN" / "USER").
    public abstract String getAccountType();

    // ==================== Entity lifecycle ====================

    @PrePersist
    protected void onCreate() {
        // * Backup kalau createdAt belum di-set sebelum entity di-persist.
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    // ==================== Object overrides ====================

    @Override
    public String toString() {
        // * Representasi singkat untuk logging.
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
        // * Dua Account dianggap sama jika memiliki ID yang sama.
        if (this == o) return true;
        if (!(o instanceof Account)) return false;
        Account account = (Account) o;
        return accountId != null && accountId.equals(account.accountId);
    }

    @Override
    public int hashCode() {
        // * Mengikuti pola umum entity JPA dengan inheritance.
        return getClass().hashCode();
    }
}
