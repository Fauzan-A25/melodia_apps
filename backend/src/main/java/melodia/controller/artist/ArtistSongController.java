// controller/artist/ArtistSongController.java
package melodia.controller.artist;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import melodia.model.entity.Artist;
import melodia.model.entity.Genre;
import melodia.model.entity.Song;
import melodia.model.repository.ArtistRepository;
import melodia.model.repository.GenreRepository;
import melodia.model.repository.SongRepository;
import melodia.view.service.music.FileStorageService;

@RestController
@RequestMapping("/api/artist/songs")
@CrossOrigin(origins = "http://localhost:5173")
public class ArtistSongController {

    @Autowired
    private SongRepository songRepository;

    @Autowired
    private ArtistRepository artistRepository;

    @Autowired
    private GenreRepository genreRepository;

    @Autowired
    private FileStorageService fileStorageService;

    /**
     * Upload new song (support multi-genre)
     * POST /api/artist/songs/upload
     *
     * Frontend FormData fields:
     * - audioFile  : MultipartFile
     * - title      : String
     * - genreIds   : JSON string array, ex: ["GNR-05B7DD15","GNR-13FAB9FB"]
     * - releaseYear: int
     * - duration   : int (seconds)
     * - artistId   : String
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadSong(
            @RequestParam("audioFile") MultipartFile audioFile,
            @RequestParam("title") String title,
            @RequestParam("genreIds") String genreIdsJson,
            @RequestParam("releaseYear") int releaseYear,
            @RequestParam("duration") int duration,
            @RequestParam("artistId") String artistId) {

        try {
            // ==================== VALIDATION ====================

            if (audioFile.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Audio file is required"));
            }

            String contentType = audioFile.getContentType();
            if (contentType == null || !contentType.startsWith("audio/")) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("File must be an audio file"));
            }

            if (songRepository.existsByTitle(title)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new ErrorResponse("Song with this title already exists"));
            }

            Artist artist = artistRepository.findById(artistId)
                    .orElseThrow(() -> new RuntimeException("Artist not found"));

            // ==================== PARSE GENRE IDS ====================

            if (genreIdsJson == null || genreIdsJson.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("At least one genre is required"));
            }

            String trimmed = genreIdsJson.trim();
            if (trimmed.startsWith("[")) trimmed = trimmed.substring(1);
            if (trimmed.endsWith("]")) trimmed = trimmed.substring(0, trimmed.length() - 1);

            String[] idArray = trimmed.isBlank()
                    ? new String[0]
                    : trimmed.split("\\s*,\\s*");

            if (idArray.length == 0) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("At least one genre is required"));
            }

            List<Genre> genres = new ArrayList<>();
            for (String rawId : idArray) {
                String genreId = rawId.replace("\"", "").trim();
                if (genreId.isEmpty()) continue;

                Genre genre = genreRepository.findById(genreId)
                        .orElseThrow(() -> new RuntimeException("Genre not found: " + genreId));
                genres.add(genre);
            }

            if (genres.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("No valid genres found"));
            }

            // ==================== SAVE AUDIO FILE ====================

            String filePath = fileStorageService.saveSongFile(audioFile, artistId, title);

            // ==================== CREATE SONG ENTITY ====================

            Song song = new Song();
            song.setSongId("SNG" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            song.setTitle(title);
            song.setArtistName(artist.getUsername());
            song.setArtist(artist);
            song.setGenres(genres); // multi-genre
            song.setDuration(duration);
            song.setReleaseYear(releaseYear);
            song.setFilePath(filePath);
            song.setUploadedAt(LocalDateTime.now());

            Song savedSong = songRepository.save(song);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedSong);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to upload song: " + e.getMessage()));
        }
    }

    /**
     * Delete song (Artist only can delete their own songs)
     * DELETE /api/artist/songs/{songId}?artistId=...
     */
    @DeleteMapping("/{songId}")
    public ResponseEntity<?> deleteSong(
            @PathVariable String songId,
            @RequestParam String artistId) {
        try {
            Song song = songRepository.findById(songId)
                    .orElseThrow(() -> new RuntimeException("Song not found"));

            if (!song.getArtist().getAccountId().equals(artistId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("You can only delete your own songs"));
            }

            fileStorageService.deleteFile(song.getFilePath());
            songRepository.delete(song);

            return ResponseEntity.ok(new SuccessResponse("Song deleted successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to delete song: " + e.getMessage()));
        }
    }

    // ==================== INNER RESPONSE CLASSES ====================

    static class ErrorResponse {
        private final String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }
    }

    static class SuccessResponse {
        private final String message;

        public SuccessResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }
    }
}
