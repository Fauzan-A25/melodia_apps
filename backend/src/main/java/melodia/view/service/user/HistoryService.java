package melodia.view.service.user;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import melodia.model.entity.History;
import melodia.model.entity.Song;
import melodia.model.repository.HistoryRepository;
import melodia.model.repository.UserRepository;

@Service
public class HistoryService {

    @Autowired
    private HistoryRepository historyRepository;

    @Autowired
    private UserRepository userRepository;

    // ==================== Get History ====================

    /**
     * Ambil history berdasarkan userId (PK)
     */
    @Transactional(readOnly = true)
    public History getUserHistory(String userId) {
        return historyRepository.findById(userId).orElse(null);
    }

    /**
     * Cek apakah user sudah punya history
     */
    @Transactional(readOnly = true)
    public boolean hasHistory(String userId) {
        return historyRepository.existsById(userId);
    }

    // ==================== Manage Played Songs ====================

    /**
     * Dapatkan semua lagu yang pernah diputar user (urutan terbaru dulu)
     */
    @Transactional(readOnly = true)
    public List<Song> getPlayedSongs(String userId) {
        History history = getUserHistory(userId);
        return history != null ? history.getPlayedSongs() : Collections.emptyList();
    }

    /**
     * ✅ Tambahkan lagu ke history dengan "move to front" logic
     * - Kalau lagu sudah ada → pindah ke depan
     * - Kalau belum ada → tambah di depan
     */
    @Transactional
    public void addSongToHistory(String userId, Song song) {
        if (song == null) {
            throw new IllegalArgumentException("Song tidak boleh null");
        }

        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User tidak ditemukan");
        }

        // Ambil atau buat history baru
        History history = historyRepository.findById(userId)
            .orElseGet(() -> {
                History newHistory = new History(userId);
                return historyRepository.save(newHistory);
            });
        
        // ✅ Method addPlayedSong sudah handle "move to front"
        // (remove kalau sudah ada, lalu add di index 0)
        history.addPlayedSong(song);
        
        historyRepository.save(history);
        
        System.out.println("✅ Song added/moved to front: " 
            + song.getTitle() + " (Total: " + history.getPlayedSongsCount() + ")");
    }

    /**
     * Hapus satu lagu dari history
     */
    @Transactional
    public void removeSongFromHistory(String userId, Song song) {
        if (song == null) {
            throw new IllegalArgumentException("Song tidak boleh null");
        }

        History history = historyRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("History tidak ditemukan untuk user: " + userId));
        
        if (!history.hasPlayedSong(song)) {
            throw new IllegalArgumentException("Song tidak ditemukan di history");
        }
        
        history.removePlayedSong(song);
        historyRepository.save(history);
    }

    /**
     * Reset semua history user (clear all played songs)
     */
    @Transactional
    public void clearUserHistory(String userId) {
        History history = historyRepository.findById(userId).orElse(null);
        
        if (history != null) {
            history.getPlayedSongs().clear();
            historyRepository.save(history);
        }
    }

    /**
     * Cek apakah lagu pernah diputar oleh user
     */
    @Transactional(readOnly = true)
    public boolean hasUserPlayedSong(String userId, Song song) {
        if (song == null) return false;

        History history = getUserHistory(userId);
        return history != null && history.hasPlayedSong(song);
    }

    /**
     * Get jumlah lagu di history
     */
    @Transactional(readOnly = true)
    public int getPlayedSongsCount(String userId) {
        History history = getUserHistory(userId);
        return history != null ? history.getPlayedSongsCount() : 0;
    }

    /**
     * ✅ Get recently played songs (N terbaru dari depan)
     * Karena list sudah urut terbaru dulu, ambil N pertama
     */
    @Transactional(readOnly = true)
    public List<Song> getRecentlyPlayedSongs(String userId, int limit) {
        List<Song> playedSongs = getPlayedSongs(userId);
        
        if (playedSongs.isEmpty()) {
            return Collections.emptyList();
        }
        
        // ✅ Ambil N pertama (karena index 0 = terbaru)
        return playedSongs.stream()
            .limit(limit)
            .collect(Collectors.toList());
    }

    /**
     * Get history summary (untuk dashboard)
     */
    @Transactional(readOnly = true)
    public HistorySummary getHistorySummary(String userId) {
        History history = historyRepository.findById(userId).orElse(null);
        
        if (history == null) {
            return new HistorySummary(userId, 0, false);
        }
        
        return new HistorySummary(
            userId, 
            history.getPlayedSongsCount(), 
            true
        );
    }

    // ==================== Inner Class: History Summary ====================
    
    public static class HistorySummary {
        private final String userId;
        private final int playedSongsCount;
        private final boolean exists;

        public HistorySummary(String userId, int playedSongsCount, boolean exists) {
            this.userId = userId;
            this.playedSongsCount = playedSongsCount;
            this.exists = exists;
        }

        public String getUserId() { return userId; }
        public int getPlayedSongsCount() { return playedSongsCount; }
        public boolean isExists() { return exists; }
    }
}
