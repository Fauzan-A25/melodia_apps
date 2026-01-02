package melodia.model.service.user;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import melodia.controller.exception.user.UserNotFoundException;
import melodia.model.entity.Account;
import melodia.model.entity.History;
import melodia.model.entity.Playlist;
import melodia.model.entity.Song;
import melodia.model.entity.User;
import melodia.model.repository.AccountRepository;
import melodia.model.repository.HistoryRepository;

@Service
public class UserService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private HistoryRepository historyRepository;

    // ==================== User CRUD ====================

    public List<User> getAllUsers() {
        return accountRepository.findAll().stream()
            .filter(acc -> acc instanceof User)
            .map(acc -> (User) acc)
            .toList();
    }

    public User getUserById(String id) {
        Account account = accountRepository.findById(id).orElse(null);
        return account instanceof User ? (User) account : null;
    }

    public User getUserByUsername(String username) {
        Account account = accountRepository.findByUsername(username).orElse(null);
        return account instanceof User ? (User) account : null;
    }

    @Transactional
    public User updateUserProfile(String id, String newUsername, String newEmail) {
        Account account = accountRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("User tidak ditemukan"));
        User user = account instanceof User ? (User) account : null;
        if (user == null) throw new UserNotFoundException("User tidak ditemukan");
        
        if (newUsername != null && !newUsername.equals(user.getUsername())) {
            if (accountRepository.existsByUsername(newUsername)) {
                throw new UserNotFoundException("Username sudah dipakai.");
            }
            user.setUsername(newUsername);
        }
        
        if (newEmail != null && !newEmail.equals(user.getEmail())) {
            if (accountRepository.existsByEmail(newEmail)) {
                throw new UserNotFoundException("Email sudah dipakai.");
            }
            user.setEmail(newEmail);
        }
        
        return (User) accountRepository.save(user);
    }

    @Transactional
    public void deleteUser(String id) {
        Account account = accountRepository.findById(id).orElse(null);
        if (account == null || !(account instanceof User)) return;
        User user = (User) account;
        
        // Delete history by userId
        historyRepository.findById(id).ifPresent(historyRepository::delete);
        
        // Delete user (cascade akan delete playlists)
        accountRepository.delete(user);
    }

    // ==================== History Operations ====================

    /**
     * Get history milik user (query langsung dari repository)
     */
    public History getUserHistory(String userId) {
        return historyRepository.findById(userId).orElse(null);
    }

    /**
     * Tambahkan lagu ke history user
     */
    @Transactional
    public void addSongToHistory(String userId, Song song) {
        History history = historyRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("History tidak ditemukan"));
        
        history.addPlayedSong(song);
        historyRepository.save(history);
    }

    /**
     * Get played songs dari history user
     */
    public List<Song> getUserPlayedSongs(String userId) {
        History history = historyRepository.findById(userId).orElse(null);
        return history != null ? history.getPlayedSongs() : List.of();
    }

    /**
     * Clear history user
     */
    @Transactional
    public void clearUserHistory(String userId) {
        History history = historyRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("History tidak ditemukan"));
        
        history.getPlayedSongs().clear();
        historyRepository.save(history);
    }

    // ==================== Playlist Operations ====================

    /**
     * Get playlist milik user
     */
    public List<Playlist> getUserPlaylists(String userId) {
        Account account = accountRepository.findById(userId).orElse(null);
        if (account instanceof User) {
            return ((User) account).getPlaylists();
        }
        return List.of();
    }

    /**
     * Buat playlist baru untuk user
     */
    @Transactional
    public Playlist createPlaylistForUser(String userId, String playlistName) {
        Account account = accountRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"));
        User user = account instanceof User ? (User) account : null;
        if (user == null) throw new IllegalArgumentException("User tidak ditemukan");
        
        Playlist playlist = user.createPlaylist(playlistName);
        accountRepository.save(user);  // Cascade save playlist baru
        
        return playlist;
    }

    // ==================== Utility Methods ====================

    /**
     * Get history song count
     */
    public int getHistorySongCount(String userId) {
        History history = historyRepository.findById(userId).orElse(null);
        return history != null ? history.getPlayedSongs().size() : 0;
    }
    
    /**
     * Get total playlists count
     */
    public int getUserPlaylistCount(String userId) {
        Account account = accountRepository.findById(userId).orElse(null);
        if (account instanceof User) {
            return ((User) account).getPlaylists().size();
        }
        return 0;
    }
}
