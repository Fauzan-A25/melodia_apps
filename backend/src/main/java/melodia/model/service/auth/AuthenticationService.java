package melodia.model.service.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import melodia.controller.exception.auth.InvalidCredentialsException;
import melodia.model.entity.Account;
import melodia.model.entity.Admin;
import melodia.model.entity.User;
import melodia.model.repository.AccountRepository;

@Service
public class AuthenticationService {

    @Autowired
    private AccountRepository accountRepository;

    // ==================== LOGIN GENERIC (Account) ====================

    public Account login(String usernameOrEmail, String password) {
        Account account = accountRepository.findByUsername(usernameOrEmail)
                .orElse(accountRepository.findByEmail(usernameOrEmail).orElse(null));

        if (account == null) {
            throw new InvalidCredentialsException();
        }

        if (!account.verifyPassword(password)) {
            throw new InvalidCredentialsException();
        }

        return account;
    }

    // ==================== LOGIN SPESIFIK USER ====================

    public User loginUser(String usernameOrEmail, String password) {
        Account account = accountRepository.findByUsername(usernameOrEmail)
                .orElse(accountRepository.findByEmail(usernameOrEmail).orElse(null));

        if (!(account instanceof User) || !account.verifyPassword(password)) {
            throw new InvalidCredentialsException();
        }

        return (User) account;
    }

    // ==================== LOGIN SPESIFIK ADMIN ====================

    public Admin loginAdmin(String usernameOrEmail, String password) {
        Account account = accountRepository.findByUsername(usernameOrEmail)
                .orElse(accountRepository.findByEmail(usernameOrEmail).orElse(null));

        if (!(account instanceof Admin) || !account.verifyPassword(password)) {
            throw new InvalidCredentialsException();
        }

        return (Admin) account;
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
                .orElseThrow(InvalidCredentialsException::new);

        account.setUsername(username);
        account.setEmail(email);

        return accountRepository.save(account);
    }

    public void changePassword(String accountId, String currentPassword, String newPassword) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(InvalidCredentialsException::new);

        if (!account.verifyPassword(currentPassword)) {
            throw new InvalidCredentialsException();
        }

        account.updatePassword(newPassword);
        accountRepository.save(account);
    }

    public void deleteCurrentAccount(String accountId) {
        if (!accountRepository.existsById(accountId)) {
            throw new InvalidCredentialsException();
        }
        accountRepository.deleteById(accountId);
    }
}
