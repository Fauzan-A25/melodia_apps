package melodia.controller.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import melodia.model.dto.request.admin.GenreRequest;
import melodia.model.dto.response.ErrorResponse;
import melodia.model.dto.response.GenreResponse;
import melodia.model.service.admin.GenreService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/genres")
@CrossOrigin(origins = "http://localhost:3000")
public class GenreController {

    @Autowired
    private GenreService genreService;

    // ==================== GET ALL GENRES ====================
    @GetMapping
    public ResponseEntity<?> getAllGenres() {
        try {
            List<GenreResponse> genres = genreService.getAllGenres();
            return ResponseEntity.ok(genres);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to fetch genres: " + e.getMessage()));
        }
    }

    // ==================== GET GENRE BY ID ====================
    @GetMapping("/{id}")  // ✅ Changed from {genreId} to {id}
    public ResponseEntity<?> getGenreById(@PathVariable String id) {
        try {
            GenreResponse genre = genreService.getGenreById(id);
            return ResponseEntity.ok(genre);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to fetch genre: " + e.getMessage()));
        }
    }

    // ==================== CREATE GENRE ====================
    @PostMapping
    public ResponseEntity<?> createGenre(@Valid @RequestBody GenreRequest request) {
        try {
            GenreResponse newGenre = genreService.createGenre(
                request.getName(),
                request.getDescription()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(newGenre);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to create genre: " + e.getMessage()));
        }
    }

    // ==================== UPDATE GENRE ====================
    @PutMapping("/{id}")  // ✅ Changed from {genreId} to {id}
    public ResponseEntity<?> updateGenre(
            @PathVariable String id,
            @Valid @RequestBody GenreRequest request) {
        try {
            GenreResponse updatedGenre = genreService.updateGenre(
                id,
                request.getName(),
                request.getDescription()
            );
            return ResponseEntity.ok(updatedGenre);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to update genre: " + e.getMessage()));
        }
    }

    // ==================== DELETE GENRE ====================
    @DeleteMapping("/{id}")  // ✅ Changed from {genreId} to {id}
    public ResponseEntity<?> deleteGenre(@PathVariable String id) {
        try {
            genreService.deleteGenre(id);
            return ResponseEntity.ok(new SuccessResponse("Genre deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to delete genre: " + e.getMessage()));
        }
    }

    // ==================== Inner Class: Success Response ====================
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
