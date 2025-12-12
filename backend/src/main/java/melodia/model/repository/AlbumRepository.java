package melodia.model.repository;

import melodia.model.entity.Album;
import melodia.model.entity.Artist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlbumRepository extends JpaRepository<Album, String> {

    // Ambil semua album milik satu artist
    List<Album> findByArtist(Artist artist);

    // Cari album berdasarkan title
    List<Album> findByTitleContainingIgnoreCase(String title);

    // Cari album berdasarkan genre (multi-genre: filter album yang punya genre tertentu)
    List<Album> findByGenres_NameIgnoreCase(String genreName);

    // Cari album rilis pada tahun tertentu
    List<Album> findByReleaseYear(int releaseYear);
}
