package melodia.view.service.user;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import melodia.model.entity.History;
import melodia.model.entity.Playlist;
import melodia.model.entity.Song;
import melodia.model.entity.User;
import melodia.model.repository.HistoryRepository;
import melodia.model.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HistoryRepository historyRepository;

    // ==================== User CRUD ====================

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(String id) {
        return userRepository.findById(id).orElse(null);
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    @Transactional
    public User updateUserProfile(String id, String newUsername, String newEmail) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"));
        
        if (newUsername != null && !newUsername.equals(user.getUsername())) {
            if (userRepository.existsByUsername(newUsername)) {
                throw new IllegalArgumentException("Username sudah dipakai.");
            }
            user.setUsername(newUsername);
        }
        
        if (newEmail != null && !newEmail.equals(user.getEmail())) {
            if (userRepository.existsByEmail(newEmail)) {
                throw new IllegalArgumentException("Email sudah dipakai.");
            }
            user.setEmail(newEmail);
        }
        
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(String id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return;
        
        // Delete history by userId
        historyRepository.findById(id).ifPresent(historyRepository::delete);
        
        // Delete user (cascade akan delete playlists)
        userRepository.delete(user);
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
            .orElseThrow(() -> new IllegalArgumentException("History tidak ditemukan"));
        
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
        User user = userRepository.findById(userId).orElse(null);
        return user != null ? user.getPlaylists() : List.of();
    }

    /**
     * Buat playlist baru untuk user
     */
    @Transactional
    public Playlist createPlaylistForUser(String userId, String playlistName) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"));
        
        Playlist playlist = user.createPlaylist(playlistName);
        userRepository.save(user);  // Cascade save playlist baru
        
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
        User user = userRepository.findById(userId).orElse(null);
        return user != null ? user.getPlaylists().size() : 0;
    }
}
