package melodia.view.service.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import melodia.model.entity.Admin;
import melodia.model.entity.History;
import melodia.model.entity.User;
import melodia.model.repository.AccountRepository;
import melodia.model.repository.AdminRepository;
import melodia.model.repository.HistoryRepository;
import melodia.model.repository.UserRepository;

@Service
public class RegistrationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private HistoryRepository historyRepository;

    // ==================== Register User (Listener / Pendengar) ====================

    @Transactional
    public User registerUser(String username, String email, String password) {
        // Validasi duplikasi
        if (accountRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username sudah digunakan");
        }
        if (accountRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email sudah digunakan");
        }

        // 1. Buat dan save User
        User user = new User(username, email, password);
        String userId = "USR" + System.currentTimeMillis();
        user.setAccountId(userId);
        user = userRepository.save(user);

        // 2. Buat dan save History (riwayat dengar)
        History history = new History(userId);
        historyRepository.save(history);

        return user;
    }

    // ==================== Register Admin ====================

    @Transactional
    public Admin registerAdmin(String username, String email, String password, String requestedByAdminId) {
        // Validasi requester adalah admin
        adminRepository.findById(requestedByAdminId)
            .orElseThrow(() -> new SecurityException("Hanya admin yang bisa membuat admin baru"));

        // Validasi duplikasi
        if (accountRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username sudah digunakan");
        }
        if (accountRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email sudah digunakan");
        }

        // Buat dan save Admin
        Admin admin = new Admin(username, email, password);
        admin.setAccountId("ADM" + System.currentTimeMillis());

        return adminRepository.save(admin);
    }

    // ==================== Helper: Check Account Exists ====================

    public boolean isUsernameExists(String username) {
        return accountRepository.existsByUsername(username);
    }

    public boolean isEmailExists(String email) {
        return accountRepository.existsByEmail(email);
    }
}
