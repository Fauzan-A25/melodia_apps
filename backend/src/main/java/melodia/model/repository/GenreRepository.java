package melodia.model.repository;

import melodia.model.entity.Genre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface GenreRepository extends JpaRepository<Genre, String> {
    
    // Cari genre berdasarkan nama (unique)
    Optional<Genre> findByName(String name);

    // Search genre by keyword (case-insensitive)
    List<Genre> findByNameContainingIgnoreCase(String keyword);

    // Cek duplikasi nama genre
    boolean existsByName(String name);
}
