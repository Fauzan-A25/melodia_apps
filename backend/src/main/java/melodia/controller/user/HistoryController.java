package melodia.controller.user;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import melodia.model.dto.request.user.AddSongToHistoryRequestDTO;
import melodia.model.dto.response.history.ApiResponseDTO;
import melodia.model.dto.response.history.HistoryResponseDTO;
import melodia.model.dto.response.history.HistorySummaryResponseDTO;
import melodia.model.dto.response.history.PlayedSongsResponseDTO;
import melodia.model.dto.response.history.SongPlayedCheckResponseDTO;
import melodia.model.entity.Song;
import melodia.model.repository.SongRepository;
import melodia.view.service.user.HistoryService;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    @Autowired
    private HistoryService historyService;

    @Autowired
    private SongRepository songRepository;

    // ==================== Get History ====================

    /**
     * GET /api/history/{userId}
     * Mendapatkan informasi history user
     */
    @GetMapping("/{userId}")
    public ResponseEntity<HistoryResponseDTO> getUserHistory(@PathVariable String userId) {
        // ✅ Return summary walaupun history kosong (bukan 404)
        HistoryResponseDTO response = new HistoryResponseDTO(
            userId,
            historyService.getPlayedSongsCount(userId),
            historyService.hasHistory(userId)
        );
        
        return ResponseEntity.ok(response);
    }

    // ==================== Get Played Songs ====================

    /**
     * GET /api/history/{userId}/songs
     * Mendapatkan semua lagu yang pernah diputar user (urutan terbaru dulu)
     */
    @GetMapping("/{userId}/songs")
    public ResponseEntity<PlayedSongsResponseDTO> getPlayedSongs(@PathVariable String userId) {
        // ✅ Return empty list kalau tidak ada, bukan 404
        List<Song> songs = historyService.getPlayedSongs(userId);
        PlayedSongsResponseDTO response = new PlayedSongsResponseDTO(userId, songs);
        
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/history/{userId}/songs/recent?limit=10
     * Mendapatkan lagu yang baru-baru ini diputar (N terbaru)
     */
    @GetMapping("/{userId}/songs/recent")
    public ResponseEntity<PlayedSongsResponseDTO> getRecentlyPlayedSongs(
            @PathVariable String userId,
            @RequestParam(defaultValue = "10") int limit) {
        
        if (limit <= 0) {
            return ResponseEntity.badRequest().build();
        }

        // ✅ Return empty list kalau tidak ada, bukan 404
        List<Song> recentSongs = historyService.getRecentlyPlayedSongs(userId, limit);
        PlayedSongsResponseDTO response = new PlayedSongsResponseDTO(userId, recentSongs);
        
        return ResponseEntity.ok(response);
    }

    // ==================== Add Song to History ====================

    /**
     * POST /api/history/{userId}/songs
     * Menambahkan lagu ke history (saat user play song)
     * ✅ Auto-create history kalau belum ada
     * ✅ Move to front kalau lagu sudah pernah diputar
     */
    @PostMapping("/{userId}/songs")
    public ResponseEntity<ApiResponseDTO> addSongToHistory(
            @PathVariable String userId,
            @Valid @RequestBody AddSongToHistoryRequestDTO request) {
        
        try {
            Song song = songRepository.findById(request.getSongId())
                .orElseThrow(() -> new IllegalArgumentException("Song tidak ditemukan"));

            // Service akan auto-create history kalau belum ada
            historyService.addSongToHistory(userId, song);
            
            ApiResponseDTO response = new ApiResponseDTO(
                true,
                "Song berhasil ditambahkan ke history"
            );
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            // User tidak ditemukan atau song tidak ada
            ApiResponseDTO response = new ApiResponseDTO(false, e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            // Unexpected error
            ApiResponseDTO response = new ApiResponseDTO(false, "Gagal menambahkan song ke history");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ==================== Remove Song from History ====================

    /**
     * DELETE /api/history/{userId}/songs/{songId}
     * Menghapus satu lagu dari history
     */
    @DeleteMapping("/{userId}/songs/{songId}")
    public ResponseEntity<ApiResponseDTO> removeSongFromHistory(
            @PathVariable String userId,
            @PathVariable String songId) {
        
        try {
            Song song = songRepository.findById(songId)
                .orElseThrow(() -> new IllegalArgumentException("Song tidak ditemukan"));

            historyService.removeSongFromHistory(userId, song);
            
            ApiResponseDTO response = new ApiResponseDTO(
                true,
                "Song berhasil dihapus dari history"
            );
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            // History tidak ada atau song tidak ada di history
            ApiResponseDTO response = new ApiResponseDTO(false, e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            ApiResponseDTO response = new ApiResponseDTO(false, "Gagal menghapus song dari history");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ==================== Clear History ====================

    /**
     * DELETE /api/history/{userId}
     * Menghapus semua history user
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponseDTO> clearUserHistory(@PathVariable String userId) {
        // ✅ Success walaupun history tidak ada (idempotent)
        historyService.clearUserHistory(userId);
        
        ApiResponseDTO response = new ApiResponseDTO(
            true,
            "History berhasil dihapus"
        );
        
        return ResponseEntity.ok(response);
    }

    // ==================== Check if Song Played ====================

    /**
     * GET /api/history/{userId}/songs/{songId}/played
     * Mengecek apakah lagu pernah diputar oleh user
     */
    @GetMapping("/{userId}/songs/{songId}/played")
    public ResponseEntity<SongPlayedCheckResponseDTO> checkIfSongPlayed(
            @PathVariable String userId,
            @PathVariable String songId) {
        
        Song song = songRepository.findById(songId).orElse(null);
        boolean hasPlayed = song != null && historyService.hasUserPlayedSong(userId, song);
        
        SongPlayedCheckResponseDTO response = new SongPlayedCheckResponseDTO(
            userId,
            songId,
            hasPlayed
        );
        
        return ResponseEntity.ok(response);
    }

    // ==================== Get History Summary ====================

    /**
     * GET /api/history/{userId}/summary
     * Mendapatkan ringkasan history untuk dashboard
     */
    @GetMapping("/{userId}/summary")
    public ResponseEntity<HistorySummaryResponseDTO> getHistorySummary(@PathVariable String userId) {
        HistoryService.HistorySummary summary = historyService.getHistorySummary(userId);
        
        HistorySummaryResponseDTO response = new HistorySummaryResponseDTO(
            summary.getUserId(),
            summary.getPlayedSongsCount(),
            summary.isExists()
        );
        
        return ResponseEntity.ok(response);
    }
}
