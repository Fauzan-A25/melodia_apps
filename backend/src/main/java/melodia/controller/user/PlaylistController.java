package melodia.controller.user;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus; 
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import melodia.model.entity.Playlist;
import melodia.model.entity.Song;
import melodia.model.service.music.PlaylistService;

@RestController
@RequestMapping("/api/playlists")
public class PlaylistController {

    // ✅ Tambahkan Logger
    private static final Logger logger = LoggerFactory.getLogger(PlaylistController.class);

    @Autowired
    private PlaylistService playlistService;

    /**
     * Create new playlist
     * POST /api/playlists
     */
    @PostMapping
    public ResponseEntity<?> createPlaylist(@RequestBody Map<String, String> request) {
        logger.info("========== CREATE PLAYLIST REQUEST ==========");
        logger.debug("Request body: {}", request);
        
        try {
            String userId = request.get("userId");
            String name = request.get("name");
            String description = request.get("description");

            if (userId == null || userId.trim().isEmpty()) {
                logger.error("userId is null or empty");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "User ID is required"));
            }

            if (name == null || name.trim().isEmpty()) {
                logger.error("name is null or empty");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Playlist name is required"));
            }

            Playlist playlist = playlistService.createPlaylist(userId, name, description);
            logger.info("✅ Playlist created successfully: {}", playlist.getPlaylistId());
            return ResponseEntity.status(HttpStatus.CREATED).body(playlist);
            
        } catch (Exception e) {
            // ✅ Ganti printStackTrace dengan logger.error
            logger.error("❌ ERROR creating playlist: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserPlaylists(@PathVariable String userId) {
        logger.info("========== GET USER PLAYLISTS ==========");
        logger.debug("userId: {}", userId);
        
        try {
            List<Playlist> playlists = playlistService.getUserPlaylists(userId);
            logger.info("✅ Found {} playlists", playlists.size());
            return ResponseEntity.ok(playlists);
        } catch (Exception e) {
            logger.error("❌ ERROR fetching playlists: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{playlistId}")
    public ResponseEntity<?> getPlaylistById(@PathVariable String playlistId) {
        logger.info("========== GET PLAYLIST BY ID ==========");
        logger.debug("playlistId: {}", playlistId);
        
        try {
            Playlist playlist = playlistService.getPlaylistById(playlistId);
            logger.info("✅ Playlist found: {}", playlist.getName());
            return ResponseEntity.ok(playlist);
        } catch (Exception e) {
            logger.error("❌ ERROR: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{playlistId}")
    public ResponseEntity<?> updatePlaylist(
        @PathVariable String playlistId,
        @RequestBody Map<String, String> request
    ) {
        logger.info("========== UPDATE PLAYLIST ==========");
        logger.debug("playlistId: {}, Request: {}", playlistId, request);
        
        try {
            String userId = request.get("userId");
            String name = request.get("name");
            String description = request.get("description");

            Playlist playlist = playlistService.updatePlaylist(playlistId, userId, name, description);
            logger.info("✅ Playlist updated successfully");
            return ResponseEntity.ok(playlist);
        } catch (Exception e) {
            logger.error("❌ ERROR: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{playlistId}")
    public ResponseEntity<?> deletePlaylist(
        @PathVariable String playlistId,
        @RequestParam String userId
    ) {
        logger.info("========== DELETE PLAYLIST ==========");
        logger.debug("playlistId: {}, userId: {}", playlistId, userId);
        
        try {
            playlistService.deletePlaylist(playlistId, userId);
            logger.info("✅ Playlist deleted successfully");
            return ResponseEntity.ok(Map.of("message", "Playlist deleted successfully"));
        } catch (Exception e) {
            logger.error("❌ ERROR: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{playlistId}/songs")
    public ResponseEntity<?> addSongToPlaylist(
        @PathVariable String playlistId,
        @RequestBody Map<String, String> request
    ) {
        logger.info("========== ADD SONG TO PLAYLIST ==========");
        logger.debug("playlistId: {}, Request: {}", playlistId, request);
        
        try {
            String songId = request.get("songId");
            String userId = request.get("userId");

            Playlist playlist = playlistService.addSongToPlaylist(playlistId, songId, userId);
            logger.info("✅ Song added successfully");
            return ResponseEntity.ok(playlist);
        } catch (Exception e) {
            logger.error("❌ ERROR: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{playlistId}/songs/{songId}")
    public ResponseEntity<?> removeSongFromPlaylist(
        @PathVariable String playlistId,
        @PathVariable String songId,
        @RequestParam String userId
    ) {
        logger.info("========== REMOVE SONG FROM PLAYLIST ==========");
        logger.debug("playlistId: {}, songId: {}, userId: {}", playlistId, songId, userId);
        
        try {
            Playlist playlist = playlistService.removeSongFromPlaylist(playlistId, songId, userId);
            logger.info("✅ Song removed successfully");
            return ResponseEntity.ok(playlist);
        } catch (Exception e) {
            logger.error("❌ ERROR: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchPlaylists(@RequestParam String query) {
        logger.info("========== SEARCH PLAYLISTS ==========");
        logger.debug("query: {}", query);
        
        try {
            List<Playlist> playlists = playlistService.searchPlaylistsByName(query);
            logger.info("✅ Found {} playlists", playlists.size());
            return ResponseEntity.ok(playlists);
        } catch (Exception e) {
            logger.error("❌ ERROR: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{playlistId}/songs")
    public ResponseEntity<?> getPlaylistSongs(@PathVariable String playlistId) {
        logger.info("========== GET PLAYLIST SONGS ==========");
        logger.debug("playlistId: {}", playlistId);
        
        try {
            List<Song> songs = playlistService.getPlaylistSongs(playlistId);
            logger.info("✅ Found {} songs", songs.size());
            return ResponseEntity.ok(songs);
        } catch (Exception e) {
            logger.error("❌ ERROR: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        }
    }
}
