package melodia.model.repository;

import melodia.model.entity.Playlist;
import melodia.model.entity.User;
import melodia.model.entity.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, String> {

    // Cari semua playlist milik user/artist tertentu
    List<Playlist> findByOwner(User owner);

    // Cari playlist berdasarkan nama (case-insensitive, cocok untuk fitur search)
    List<Playlist> findByNameContainingIgnoreCase(String name);

    // Cari playlist berdasarkan deskripsi (search fitur)
    List<Playlist> findByDescriptionContainingIgnoreCase(String description);

    // Cari playlist yang berisi lagu tertentu
    List<Playlist> findBySongsContaining(Song song);

    // Hitung jumlah playlist milik user
    int countByOwner(User owner);
}
