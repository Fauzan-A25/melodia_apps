package melodia.model.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import melodia.model.entity.Playlist;
import melodia.model.entity.Song;
import melodia.model.entity.User;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, String> {

    // Cari semua playlist milik user/artist tertentu
    List<Playlist> findByOwner(User owner);

    // Cari playlist berdasarkan nama (case-insensitive, cocok untuk fitur search)
    List<Playlist> findByNameContainingIgnoreCase(String name);

    // Cari playlist yang berisi lagu tertentu
    List<Playlist> findBySongsContaining(Song song);
}
