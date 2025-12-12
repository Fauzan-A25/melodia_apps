package melodia.view.service.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import melodia.model.entity.Account;
import melodia.model.entity.Admin;
import melodia.model.entity.User;
import melodia.model.repository.AccountRepository;
import melodia.model.repository.AdminRepository;
import melodia.model.repository.UserRepository;

@Service
public class AuthenticationService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    // ==================== LOGIN GENERIC (Account) ====================

    public Account login(String usernameOrEmail, String password) {
        Account account = accountRepository.findByUsername(usernameOrEmail)
                .orElse(accountRepository.findByEmail(usernameOrEmail).orElse(null));

        if (account == null) {
            throw new IllegalArgumentException("Akun tidak ditemukan");
        }

        if (!account.verifyPassword(password)) {
            throw new IllegalArgumentException("Password salah");
        }

        return account;
    }

    // ==================== LOGIN SPESIFIK USER ====================

    public User loginUser(String usernameOrEmail, String password) {
        User user = userRepository.findByUsername(usernameOrEmail)
                .orElse(userRepository.findByEmail(usernameOrEmail).orElse(null));

        if (user == null || !user.verifyPassword(password)) {
            throw new IllegalArgumentException("Username/email atau password salah");
        }

        return user;
    }

    // ==================== LOGIN SPESIFIK ADMIN ====================

    public Admin loginAdmin(String usernameOrEmail, String password) {
        Admin admin = adminRepository.findByUsername(usernameOrEmail)
                .orElse(adminRepository.findByEmail(usernameOrEmail).orElse(null));

        if (admin == null || !admin.verifyPassword(password)) {
            throw new IllegalArgumentException("Username/email atau password salah");
        }

        return admin;
    }

    // ==================== HELPER: CHECK ACCOUNT EXISTS ====================

    public boolean isAccountExists(String usernameOrEmail) {
        return accountRepository.findByUsername(usernameOrEmail).isPresent()
                || accountRepository.findByEmail(usernameOrEmail).isPresent();
    }

    // ==================== SETTINGS (PROFILE & PASSWORD) ====================

    /**
     * Update profile untuk Account (User/Admin).
     * Artist tidak lagi menjadi turunan Account, jadi tidak di-handle di sini.
     */
    public Account updateProfile(String accountId, String username, String email) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        account.setUsername(username);
        account.setEmail(email);

        return accountRepository.save(account);
    }

    public void changePassword(String accountId, String currentPassword, String newPassword) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        if (!account.verifyPassword(currentPassword)) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        account.updatePassword(newPassword);
        accountRepository.save(account);
    }

    public void deleteCurrentAccount(String accountId) {
        if (!accountRepository.existsById(accountId)) {
            throw new IllegalArgumentException("Account not found");
        }
        accountRepository.deleteById(accountId);
    }
}
