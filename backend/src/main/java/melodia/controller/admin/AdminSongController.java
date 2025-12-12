// controller/admin/AdminSongController.java
package melodia.controller.admin;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import melodia.model.entity.Song;
import melodia.model.repository.SongRepository;
import melodia.view.service.music.FileStorageService;

@RestController
@RequestMapping("/api/admin/songs")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminSongController {

    private static final Logger logger = LoggerFactory.getLogger(AdminSongController.class);

    @Autowired
    private SongRepository songRepository;

    @Autowired
    private FileStorageService fileStorageService;

    /**
     * Admin delete any song
     * DELETE /api/admin/songs/{songId}
     */
    @DeleteMapping("/{songId}")
    public ResponseEntity<?> adminDeleteSong(@PathVariable String songId) {
        logger.info("Admin deleting song: {}", songId);
        
        try {
            Song song = songRepository.findById(songId)
                    .orElseThrow(() -> new RuntimeException("Song not found"));

            // Admin can delete any song without ownership check
            try {
                fileStorageService.deleteFile(song.getFilePath());
            } catch (Exception e) {
                // Log error but continue to delete from database
                logger.error("Warning: Could not delete file from storage: {}", e.getMessage());
            }

            songRepository.delete(song);
            logger.info("✅ Song deleted successfully by admin");

            return ResponseEntity.ok(new SuccessResponse("Song deleted successfully by admin"));

        } catch (RuntimeException e) {
            logger.error("❌ Song not found: {}", e.getMessage());
            return ResponseEntity.status(404)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Error deleting song: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(new ErrorResponse("Failed to delete song: " + e.getMessage()));
        }
    }

    // Response classes
    static class ErrorResponse {
        private final String message;
        public ErrorResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
    }

    static class SuccessResponse {
        private final String message;
        public SuccessResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
    }
}
