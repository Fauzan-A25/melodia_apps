package melodia.controller.admin;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import melodia.model.dto.request.auth.RegisterArtistRequest;
import melodia.model.entity.Artist;
import melodia.model.repository.ArtistRepository;

@RestController
@RequestMapping("/api/admin/artists")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminArtistController {

    private static final Logger logger = LoggerFactory.getLogger(AdminArtistController.class);

    private final ArtistRepository artistRepository;

    public AdminArtistController(ArtistRepository artistRepository) {
        this.artistRepository = artistRepository;
    }

    /**
     * Get all artists (metadata) for admin.
     * GET /api/admin/artists
     */
    @GetMapping
    public ResponseEntity<List<Artist>> getAllArtists() {
        logger.info("Admin fetching all artists metadata");
        List<Artist> artists = artistRepository.findAll();
        return ResponseEntity.ok(artists);
    }

    /**
     * Create new artist metadata.
     * POST /api/admin/artists
     */
    @PostMapping
    public ResponseEntity<?> createArtist(@Valid @RequestBody RegisterArtistRequest request) {
        logger.info("Admin creating artist: {}", request.getArtistName());
        if (artistRepository.existsByArtistName(request.getArtistName())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse("Artist with this name already exists"));
        }


        Artist artist = new Artist(request.getArtistName(), request.getBio());
        Artist saved = artistRepository.save(artist);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Optional: delete artist metadata (hati-hati kalau sudah ada lagu yang refer ke sini).
     * DELETE /api/admin/artists/{artistId}
     */
    @DeleteMapping("/{artistId}")
    public ResponseEntity<?> deleteArtist(@PathVariable String artistId) {
        logger.info("Admin deleting artist: {}", artistId);

        Artist artist = artistRepository.findById(artistId)
                .orElse(null);
        if (artist == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Artist not found"));
        }

        // TODO: kalau mau, cek dulu apakah masih punya songs
        if (!artist.getSongs().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Cannot delete artist with existing songs"));
        }

        artistRepository.delete(artist);
        return ResponseEntity.ok(new SuccessResponse("Artist deleted successfully"));
    }

    // ========== SIMPLE RESPONSE WRAPPERS ==========

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
