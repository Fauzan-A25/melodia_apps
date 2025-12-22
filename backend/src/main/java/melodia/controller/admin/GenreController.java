package melodia.controller.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import melodia.model.dto.common.ApiResponse;
import melodia.model.entity.Genre;
import melodia.model.repository.GenreRepository;
import java.util.List;

@RestController
@RequestMapping("/api/admin/genres")
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
    public ResponseEntity<ApiResponse<Genre>> createGenre(@RequestParam String name) {
        if (genreRepository.existsByName(name)) {
            throw new melodia.controller.exception.music.GenreAlreadyExistsException(name);
        }
        Genre genre = new Genre();
        genre.setName(name);
        genre = genreRepository.save(genre);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Genre created successfully", genre));
    }

    // ==================== UPDATE OPERATION ====================

    @PutMapping("/{genreId}")
    public ResponseEntity<ApiResponse<Genre>> updateGenre(@PathVariable String genreId, @RequestParam String newName) {
        Genre genre = genreRepository.findById(genreId)
            .orElseThrow(() -> new melodia.controller.exception.music.GenreNotFoundException(genreId));
        genre.setName(newName);
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
