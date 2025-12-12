package melodia.view.service.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import melodia.model.entity.Admin;
import melodia.model.entity.Artist;
import melodia.model.entity.History;
import melodia.model.entity.User;
import melodia.model.repository.AccountRepository;
import melodia.model.repository.AdminRepository;
import melodia.model.repository.ArtistRepository;
import melodia.model.repository.HistoryRepository;
import melodia.model.repository.UserRepository;

@Service
public class RegistrationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ArtistRepository artistRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private HistoryRepository historyRepository;

    // ==================== Register User ====================
    
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

        // 2. Buat dan save History
        History history = new History(userId);
        historyRepository.save(history);

        return user;
    }

    // ==================== Register Artist ====================
    
    @Transactional
    public Artist registerArtist(String username, String email, String password, String bio) {
        // Validasi duplikasi
        if (accountRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username sudah digunakan");
        }
        if (accountRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email sudah digunakan");
        }

        // 1. Buat dan save Artist
        Artist artist = new Artist(username, email, password, bio);
        String artistId = "ART" + System.currentTimeMillis();
        artist.setAccountId(artistId);
        artist = artistRepository.save(artist);

        // 2. Buat dan save History
        History history = new History(artistId);
        historyRepository.save(history);

        return artist;
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

    // ==================== Upgrade User to Artist ====================
    
    @Transactional
    public Artist upgradeUserToArtist(String userId, String bio) {
        // Cari user yang akan di-upgrade
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"));

        // Buat Artist baru dengan data dari User
        Artist artist = new Artist(user.getUsername(), user.getEmail(), "dummy", bio);
        artist.setAccountId(user.getAccountId());
        artist.setPasswordHash(user.getPasswordHash());  // Copy password hash
        
        // Save Artist
        artist = artistRepository.save(artist);

        // Verify history exists (karena userId tetap sama)
        History history = historyRepository.findById(userId).orElse(null);
        
        if (history == null) {
            // Jika history tidak ada, buat baru
            history = new History(userId);
            historyRepository.save(history);
        }

        // Delete user lama (Artist sudah menggantikan User dengan accountId yang sama)
        userRepository.delete(user);
        
        return artist;
    }

    // ==================== Helper: Check Account Exists ====================
    
    public boolean isUsernameExists(String username) {
        return accountRepository.existsByUsername(username);
    }

    public boolean isEmailExists(String email) {
        return accountRepository.existsByEmail(email);
    }
}
