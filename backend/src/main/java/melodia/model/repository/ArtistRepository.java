package melodia.model.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import melodia.model.entity.Artist;

@Repository
public interface ArtistRepository extends JpaRepository<Artist, String> {

    // Cari artist berdasarkan nama (artistName)
    Optional<Artist> findByArtistName(String artistName);

    // Cek apakah nama artist sudah dipakai
    boolean existsByArtistName(String artistName);

    // Cari semua artist dengan bio yang mengandung keyword (case-insensitive)
    List<Artist> findByBioContainingIgnoreCase(String keyword);

    // Optional: search by name OR bio (kalau nanti mau dipakai)
    List<Artist> findByArtistNameContainingIgnoreCase(String keyword);

    @Query("SELECT a FROM Artist a " +
           "WHERE LOWER(a.artistName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "   OR LOWER(a.bio) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Artist> searchByName(@Param("keyword") String keyword);
}
