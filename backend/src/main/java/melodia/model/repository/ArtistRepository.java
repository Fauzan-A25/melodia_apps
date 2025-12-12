package melodia.model.repository;

import melodia.model.entity.Artist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface ArtistRepository extends JpaRepository<Artist, String> {
    
    // Cari artist berdasarkan username
    Optional<Artist> findByUsername(String username);

    // Cari artist berdasarkan email
    Optional<Artist> findByEmail(String email);

    // Cari semua artist dengan bio mengandung keyword tertentu
    List<Artist> findByBioContainingIgnoreCase(String keyword);

    // Cek apakah username sudah dipakai oleh Artist
    boolean existsByUsername(String username);

    // Cek apakah email sudah dipakai oleh Artist
    boolean existsByEmail(String email);
}
