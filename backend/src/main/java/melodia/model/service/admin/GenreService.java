package melodia.model.service.admin;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import melodia.controller.exception.music.GenreAlreadyExistsException;
import melodia.controller.exception.music.GenreNotFoundException;
import melodia.model.dto.response.GenreResponse;
import melodia.model.entity.Genre;
import melodia.model.repository.GenreRepository;

@Service
public class GenreService {

    @Autowired
    private GenreRepository genreRepository;

    /**
     * Get all genres with song count
     */
    public List<GenreResponse> getAllGenres() {
        List<Genre> genres = genreRepository.findAll();
        
        return genres.stream()
            .map(this::toGenreResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get genre by ID
     */
    public GenreResponse getGenreById(String id) {
        Genre genre = genreRepository.findById(id)
            .orElseThrow(() -> new GenreNotFoundException("Genre tidak ditemukan"));
        
        return toGenreResponse(genre);
    }

    /**
     * Create new genre
     */
    @Transactional
    public GenreResponse createGenre(String name, String description) {
        // Validasi nama tidak boleh kosong
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Genre name tidak boleh kosong");
        }

        // Cek duplikasi nama genre
        if (genreRepository.existsByName(name)) {
            throw new GenreAlreadyExistsException("Genre dengan nama '" + name + "' sudah ada");
        }

        // Generate ID
        String genreId = "GNR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Buat genre baru
        Genre newGenre = new Genre(genreId, name.trim(), description);
        Genre savedGenre = genreRepository.save(newGenre);

        return toGenreResponse(savedGenre);
    }

    /**
     * Update existing genre
     */
    @Transactional
    public GenreResponse updateGenre(String id, String name, String description) {
        // Find genre
        Genre genre = genreRepository.findById(id)
            .orElseThrow(() -> new GenreNotFoundException("Genre tidak ditemukan"));

        // Update nama jika ada dan tidak duplikat
        if (name != null && !name.trim().isEmpty()) {
            // Cek duplikasi hanya jika nama berubah
            if (!genre.getName().equals(name) && genreRepository.existsByName(name)) {
                throw new GenreAlreadyExistsException("Genre dengan nama '" + name + "' sudah ada");
            }
            genre.setName(name.trim());
        }

        // Update description
        if (description != null) {
            genre.setDescription(description.trim());
        }

        Genre updatedGenre = genreRepository.save(genre);

        return toGenreResponse(updatedGenre);
    }

    /**
     * Delete genre
     */
    @Transactional
    public void deleteGenre(String id) {
        // Check if genre exists
        Genre genre = genreRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Genre tidak ditemukan"));

        // Check if genre has songs (using the relationship)
        int songCount = genre.getSongs() != null ? genre.getSongs().size() : 0;
        
        if (songCount > 0) {
            throw new IllegalStateException(
                "Tidak dapat menghapus genre '" + genre.getName() + 
                "' karena masih memiliki " + songCount + " lagu"
            );
        }

        genreRepository.delete(genre);
    }

    /**
     * Search genres by keyword
     */
    public List<GenreResponse> searchGenres(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllGenres();
        }

        List<Genre> genres = genreRepository.findByNameContainingIgnoreCase(keyword);
        
        return genres.stream()
            .map(this::toGenreResponse)
            .collect(Collectors.toList());
    }

    /**
     * Convert Genre entity to GenreResponse DTO
     */
    private GenreResponse toGenreResponse(Genre genre) {
        int songCount = genre.getSongs() != null ? genre.getSongs().size() : 0;
        
        return new GenreResponse(
            genre.getId(),  // ✅ Changed from getGenreId()
            genre.getName(),
            genre.getDescription(),
            songCount
        );
    }
}
