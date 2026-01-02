package melodia.controller.admin;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import melodia.controller.exception.admin.ArtistAlreadyExistsException;
import melodia.controller.exception.admin.ArtistNotFoundException;
import melodia.controller.exception.admin.InvalidOperationException;
import melodia.model.dto.common.ApiResponse;
import melodia.model.dto.request.auth.RegisterArtistRequest;
import melodia.model.entity.Artist;
import melodia.model.service.artist.ArtistService;

@RestController
@RequestMapping("/api/admin/artists")
public class AdminArtistController {

    private static final Logger logger = LoggerFactory.getLogger(AdminArtistController.class);

    private final ArtistService artistService;

    public AdminArtistController(ArtistService artistService) {
        this.artistService = artistService;
    }

    /**
     * Get all artists (metadata) for admin.
     * GET /api/admin/artists
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Artist>>> getAllArtists() {
        logger.info("Admin fetching all artists metadata");
        List<Artist> artists = artistService.getAllArtists();
        return ResponseEntity.ok(ApiResponse.success("Artists fetched successfully", artists));
    }

    /**
     * Create new artist metadata.
     * POST /api/admin/artists
     */
    @PostMapping
    public ResponseEntity<ApiResponse<?>> createArtist(@Valid @RequestBody RegisterArtistRequest request) {
        logger.info("Admin creating artist: {}", request.getArtistName());
        
        try {
            Artist saved = artistService.createArtist(request.getArtistName(), request.getBio());
            logger.info("✅ Artist created successfully: {}", saved.getArtistId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Artist created successfully", saved));
        } catch (ArtistAlreadyExistsException e) {
            logger.warn("Artist with name '{}' already exists", request.getArtistName());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete artist metadata (hati-hati kalau sudah ada lagu yang refer ke sini).
     * DELETE /api/admin/artists/{artistId}
     */
    @DeleteMapping("/{artistId}")
    public ResponseEntity<ApiResponse<?>> deleteArtist(@PathVariable String artistId) {
        logger.info("Admin deleting artist: {}", artistId);

        try {
            artistService.deleteArtist(artistId);
            logger.info("✅ Artist deleted successfully: {}", artistId);
            return ResponseEntity.ok(ApiResponse.success("Artist deleted successfully"));
        } catch (ArtistNotFoundException e) {
            logger.warn("Artist not found: {}", artistId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (InvalidOperationException e) {
            logger.warn("Cannot delete artist {}: {}", artistId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
