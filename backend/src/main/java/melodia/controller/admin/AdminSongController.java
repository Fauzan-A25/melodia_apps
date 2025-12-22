package melodia.controller.admin;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import melodia.model.dto.common.ApiResponse;
import melodia.model.dto.response.admin.ArtistDropdownResponse;
import melodia.model.entity.Artist;
import melodia.model.entity.Genre;
import melodia.model.entity.Song;
import melodia.model.repository.ArtistRepository;
import melodia.model.repository.GenreRepository;
import melodia.model.repository.SongRepository;
import melodia.model.service.music.FileStorageService;
import melodia.model.service.music.SongDeletionService;

@RestController
@RequestMapping("/api/admin/songs")
public class AdminSongController {

    private static final Logger logger = LoggerFactory.getLogger(AdminSongController.class);

    @Autowired
    private SongRepository songRepository;

    @Autowired
    private ArtistRepository artistRepository;

    @Autowired
    private GenreRepository genreRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private SongDeletionService songDeletionService; // ✅ service baru untuk handle cascade delete

    /**
     * Admin upload new song (select artist from dropdown)
     * POST /api/admin/songs/upload
     *
     * FormData fields:
     * - audioFile   : MultipartFile
     * - title       : String
     * - artistId    : String (pilih dari dropdown Artist metadata)
     * - genreIds    : JSON string array ["GNR-xxx"]
     * - releaseYear : int
     * - duration    : int (seconds)
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadSong(
            @RequestParam("audioFile") MultipartFile audioFile,
            @RequestParam("title") String title,
            @RequestParam("artistId") String artistId,
            @RequestParam("genreIds") String genreIdsJson,
            @RequestParam("releaseYear") int releaseYear,
            @RequestParam("duration") int duration) {

        try {
            logger.info("Admin uploading song: {} for artist: {}", title, artistId);

            // ==================== VALIDATION ====================

            if (audioFile.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Audio file is required"));
            }

            String contentType = audioFile.getContentType();
            if (contentType == null || !contentType.startsWith("audio/")) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("File must be an audio file"));
            }

            if (songRepository.existsByTitle(title)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(ApiResponse.error("Song with this title already exists"));
            }

            // Artist metadata validation
            Artist artist = artistRepository.findById(artistId)
                    .orElseThrow(() -> new RuntimeException("Artist not found: " + artistId));

            // ==================== PARSE GENRE IDS ====================

            if (genreIdsJson == null || genreIdsJson.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("At least one genre is required"));
            }

            String trimmed = genreIdsJson.trim();
            if (trimmed.startsWith("[")) trimmed = trimmed.substring(1);
            if (trimmed.endsWith("]")) trimmed = trimmed.substring(0, trimmed.length() - 1);

            String[] idArray = trimmed.isBlank()
                    ? new String[0]
                    : trimmed.split("\\s*,\\s*");

            if (idArray.length == 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("At least one genre is required"));
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
                        .body(ApiResponse.error("No valid genres found"));
            }

            // ==================== SAVE AUDIO FILE ====================

            String filePath = fileStorageService.saveSongFile(audioFile, artistId, title);

            // ==================== CREATE SONG ENTITY ====================

            Song song = new Song();
            song.setSongId("SNG" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            song.setTitle(title);
            song.setArtist(artist); // Link ke Artist metadata
            song.setGenres(genres);
            song.setDuration(duration);
            song.setReleaseYear(releaseYear);
            song.setFilePath(filePath);
            song.setUploadedAt(LocalDateTime.now());

            Song savedSong = songRepository.save(song);

            logger.info("Song uploaded successfully: {} (ID: {})", title, savedSong.getSongId());

            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Song uploaded successfully", savedSong));

        } catch (IllegalArgumentException e) {
            logger.error("Validation error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error uploading song: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload song: " + e.getMessage()));
        }
    }

    /**
     * Admin delete any song (no ownership check needed)
     * DELETE /api/admin/songs/{songId}
     * 
     * ✅ Sekarang pakai service khusus untuk hapus semua referensi dulu
     */
    @DeleteMapping("/{songId}")
    public ResponseEntity<ApiResponse<?>> adminDeleteSong(@PathVariable String songId) {
        logger.info("Admin deleting song: {}", songId);

        try {
            // ✅ Pakai service yang handle cascade delete
            songDeletionService.deleteSongWithReferences(songId);

            logger.info("Song deleted successfully by admin: {}", songId);
            return ResponseEntity.ok(ApiResponse.success("Song deleted successfully by admin"));

        } catch (RuntimeException e) {
            logger.error("Song not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error deleting song: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete song: " + e.getMessage()));
        }
    }

    /**
     * Get all artists for admin dropdown
     * GET /api/admin/songs/artists
     */
    @GetMapping("/artists")
    public ResponseEntity<ApiResponse<List<ArtistDropdownResponse>>> getAllArtistsForDropdown() {
        List<Artist> artists = artistRepository.findAll();

        List<ArtistDropdownResponse> result = artists.stream()
                .map(a -> new ArtistDropdownResponse(
                        a.getArtistId(),
                        a.getArtistName(),
                        a.getBio()
                ))
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Artists fetched successfully", result));
    }
}
