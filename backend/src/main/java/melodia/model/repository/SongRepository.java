package melodia.model.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import melodia.model.entity.Song;

@Repository
public interface SongRepository extends JpaRepository<Song, String> {

    // Cari berdasarkan judul (case-insensitive)
    List<Song> findByTitleContainingIgnoreCase(String title);

    // Cari berdasarkan nama artist (relasi ke Artist.artistName, case-insensitive)
    List<Song> findByArtist_ArtistNameContainingIgnoreCase(String artistName);

    // Cari lagu berdasarkan genre (many-to-many ke Genre entity)
    List<Song> findByGenres_NameIgnoreCase(String genreName);

    // Cari lagu berdasarkan tahun rilis
    List<Song> findByReleaseYear(int releaseYear);

    // Cari lagu berdasarkan filePath (jika fitur file management)
    Song findByFilePath(String filePath);

    // Cek duplikasi judul
    boolean existsByTitle(String title);
}
