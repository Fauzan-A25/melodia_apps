package melodia.controller.admin;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import melodia.model.dto.common.ApiResponse;
import melodia.model.entity.Genre;
import melodia.model.repository.GenreRepository;

@RestController
@RequestMapping({"/api/genres", "/api/admin/genres"})
public class GenreController {

    @Autowired
    private GenreRepository genreRepository;

    // ==================== GET OPERATIONS ====================

    @GetMapping
    public ResponseEntity<ApiResponse<List<Genre>>> getAllGenres() {
        List<Genre> genres = genreRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Genres fetched successfully", genres));
    }

    @GetMapping("/{genreId}")
    public ResponseEntity<ApiResponse<Genre>> getGenreById(@PathVariable String genreId) {
        Genre genre = genreRepository.findById(genreId)
            .orElseThrow(() -> new melodia.controller.exception.music.GenreNotFoundException(genreId));
        return ResponseEntity.ok(ApiResponse.success("Genre fetched successfully", genre));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Genre>>> searchGenres(@RequestParam String keyword) {
        List<Genre> genres = genreRepository.findByNameContainingIgnoreCase(keyword);
        return ResponseEntity.ok(ApiResponse.success("Genres searched successfully", genres));
    }

    // ==================== CREATE OPERATION ====================

    @PostMapping
    public ResponseEntity<ApiResponse<Genre>> createGenre(
        @RequestParam String name,
        @RequestParam(required = false) String description) {
        // Validate input
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Genre name cannot be empty");
        }
        
        String trimmedName = name.trim();
        String trimmedDescription = (description != null) ? description.trim() : null;
        
        if (genreRepository.existsByName(trimmedName)) {
            throw new melodia.controller.exception.music.GenreAlreadyExistsException(trimmedName);
        }
        
        // Generate ID for new genre
        String genreId = "GNR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        
        Genre genre = new Genre();
        genre.setId(genreId);
        genre.setName(trimmedName);
        if (trimmedDescription != null && !trimmedDescription.isEmpty()) {
            genre.setDescription(trimmedDescription);
        }
        genre = genreRepository.save(genre);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Genre created successfully", genre));
    }

    // ==================== UPDATE OPERATION ====================

    @PutMapping("/{genreId}")
    public ResponseEntity<ApiResponse<Genre>> updateGenre(
        @PathVariable String genreId,
        @RequestParam String newName,
        @RequestParam(required = false) String description) {
        // Validate input
        if (newName == null || newName.trim().isEmpty()) {
            throw new IllegalArgumentException("Genre name cannot be empty");
        }
        
        String trimmedName = newName.trim();
        String trimmedDescription = (description != null) ? description.trim() : null;
        
        Genre genre = genreRepository.findById(genreId)
            .orElseThrow(() -> new melodia.controller.exception.music.GenreNotFoundException(genreId));
        
        genre.setName(trimmedName);
        if (trimmedDescription != null && !trimmedDescription.isEmpty()) {
            genre.setDescription(trimmedDescription);
        }
        genre = genreRepository.save(genre);
        return ResponseEntity.ok(ApiResponse.success("Genre updated successfully", genre));
    }

    // ==================== DELETE OPERATION ====================

    @DeleteMapping("/{genreId}")
    public ResponseEntity<ApiResponse<?>> deleteGenre(@PathVariable String genreId) {
        Genre genre = genreRepository.findById(genreId)
            .orElseThrow(() -> new melodia.controller.exception.music.GenreNotFoundException(genreId));
        genreRepository.delete(genre);
        return ResponseEntity.ok(ApiResponse.success("Genre deleted successfully"));
    }

    // ==================== STATISTICS ====================

    @GetMapping("/stats/total")
    public ResponseEntity<ApiResponse<Long>> getTotalGenres() {
        long total = genreRepository.count();
        return ResponseEntity.ok(ApiResponse.success("Total genres retrieved", total));
    }
}
