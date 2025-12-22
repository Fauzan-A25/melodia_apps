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
import melodia.model.dto.common.ApiResponse;
import melodia.model.dto.request.user.AddSongToHistoryRequestDTO;
import melodia.model.dto.response.music.HistoryResponseDTO;
import melodia.model.dto.response.music.HistorySummaryResponseDTO;
import melodia.model.dto.response.music.PlayedSongsResponseDTO;
import melodia.model.dto.response.music.SongPlayedCheckResponseDTO;
import melodia.model.entity.Song;
import melodia.model.repository.SongRepository;
import melodia.model.service.user.HistoryService;

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
    public ResponseEntity<ApiResponse<HistoryResponseDTO>> getUserHistory(@PathVariable String userId) {
        HistoryResponseDTO response = new HistoryResponseDTO(
            userId,
            historyService.getPlayedSongsCount(userId),
            historyService.hasHistory(userId)
        );
        
        return ResponseEntity.ok(ApiResponse.success("User history retrieved", response));
    }

    // ==================== Get Played Songs ====================

    /**
     * GET /api/history/{userId}/songs
     * Mendapatkan semua lagu yang pernah diputar user (urutan terbaru dulu)
     */
    @GetMapping("/{userId}/songs")
    public ResponseEntity<ApiResponse<PlayedSongsResponseDTO>> getPlayedSongs(@PathVariable String userId) {
        List<Song> songs = historyService.getPlayedSongs(userId);
        PlayedSongsResponseDTO response = new PlayedSongsResponseDTO(userId, songs);
        
        return ResponseEntity.ok(ApiResponse.success("Played songs retrieved", response));
    }

    /**
     * GET /api/history/{userId}/songs/recent?limit=10
     * Mendapatkan lagu yang baru-baru ini diputar (N terbaru)
     */
    @GetMapping("/{userId}/songs/recent")
    public ResponseEntity<ApiResponse<PlayedSongsResponseDTO>> getRecentlyPlayedSongs(
            @PathVariable String userId,
            @RequestParam(defaultValue = "10") int limit) {
        
        if (limit <= 0) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Limit must be greater than 0"));
        }

        List<Song> recentSongs = historyService.getRecentlyPlayedSongs(userId, limit);
        PlayedSongsResponseDTO response = new PlayedSongsResponseDTO(userId, recentSongs);
        
        return ResponseEntity.ok(ApiResponse.success("Recently played songs retrieved", response));
    }

    // ==================== Add Song to History ====================

    /**
     * POST /api/history/{userId}/songs
     * Menambahkan lagu ke history (saat user play song)
     * ✅ Auto-create history kalau belum ada
     * ✅ Move to front kalau lagu sudah pernah diputar
     */
    @PostMapping("/{userId}/songs")
    public ResponseEntity<ApiResponse<?>> addSongToHistory(
            @PathVariable String userId,
            @Valid @RequestBody AddSongToHistoryRequestDTO request) {
        
        try {
            Song song = songRepository.findById(request.getSongId())
                .orElseThrow(() -> new IllegalArgumentException("Song tidak ditemukan"));

            historyService.addSongToHistory(userId, song);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Song berhasil ditambahkan ke history"));
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Gagal menambahkan song ke history"));
        }
    }

    // ==================== Remove Song from History ====================

    /**
     * DELETE /api/history/{userId}/songs/{songId}
     * Menghapus satu lagu dari history
     */
    @DeleteMapping("/{userId}/songs/{songId}")
    public ResponseEntity<ApiResponse<?>> removeSongFromHistory(
            @PathVariable String userId,
            @PathVariable String songId) {
        
        try {
            Song song = songRepository.findById(songId)
                .orElseThrow(() -> new IllegalArgumentException("Song tidak ditemukan"));

            historyService.removeSongFromHistory(userId, song);
            
            return ResponseEntity.ok(ApiResponse.success("Song berhasil dihapus dari history"));
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Gagal menghapus song dari history"));
        }
    }

    // ==================== Clear History ====================

    /**
     * DELETE /api/history/{userId}
     * Menghapus semua history user
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<?>> clearUserHistory(@PathVariable String userId) {
        historyService.clearUserHistory(userId);
        return ResponseEntity.ok(ApiResponse.success("History berhasil dihapus"));
    }

    // ==================== Check if Song Played ====================

    /**
     * GET /api/history/{userId}/songs/{songId}/played
     * Mengecek apakah lagu pernah diputar oleh user
     */
    @GetMapping("/{userId}/songs/{songId}/played")
    public ResponseEntity<ApiResponse<SongPlayedCheckResponseDTO>> checkIfSongPlayed(
            @PathVariable String userId,
            @PathVariable String songId) {
        
        Song song = songRepository.findById(songId).orElse(null);
        boolean hasPlayed = song != null && historyService.hasUserPlayedSong(userId, song);
        
        SongPlayedCheckResponseDTO response = new SongPlayedCheckResponseDTO(
            userId,
            songId,
            hasPlayed
        );
        
        return ResponseEntity.ok(ApiResponse.success("Song play status retrieved", response));
    }

    // ==================== Get History Summary ====================

    /**
     * GET /api/history/{userId}/summary
     * Mendapatkan ringkasan history untuk dashboard
     */
    @GetMapping("/{userId}/summary")
    public ResponseEntity<ApiResponse<HistorySummaryResponseDTO>> getHistorySummary(@PathVariable String userId) {
        HistoryService.HistorySummary summary = historyService.getHistorySummary(userId);
        
        HistorySummaryResponseDTO response = new HistorySummaryResponseDTO(
            summary.getUserId(),
            summary.getPlayedSongsCount(),
            summary.isExists()
        );
        
        return ResponseEntity.ok(ApiResponse.success("History summary retrieved", response));
    }
}
