package melodia.model.service.music;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import melodia.controller.exception.admin.ArtistNotFoundException;
import melodia.controller.exception.music.AlbumNotFoundException;
import melodia.controller.exception.music.GenreNotFoundException;
import melodia.model.entity.Album;
import melodia.model.entity.Artist;
import melodia.model.entity.Genre;
import melodia.model.entity.Song;
import melodia.model.repository.AlbumRepository;
import melodia.model.repository.ArtistRepository;
import melodia.model.repository.GenreRepository;
import melodia.model.repository.SongRepository;

@Service
public class AlbumService {

    @Autowired
    private AlbumRepository albumRepository;

    @Autowired
    private ArtistRepository artistRepository;

    @Autowired
    private GenreRepository genreRepository;

    @Autowired
    private SongRepository songRepository;

    // ==================== READ OPERATIONS ====================

    @Transactional(readOnly = true)
    public List<Album> getAllAlbums() {
        return albumRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Album getAlbumById(String albumId) {
        return albumRepository.findById(albumId)
            .orElseThrow(() -> new AlbumNotFoundException("Album tidak ditemukan dengan ID: " + albumId));
    }

    @Transactional(readOnly = true)
    public List<Song> getAlbumSongs(String albumId) {
        Album album = getAlbumById(albumId);
        return album.getSongs();
    }

    @Transactional(readOnly = true)
    public List<Album> getAlbumsByArtist(String artistId) {
        Artist artist = artistRepository.findById(artistId)
            .orElseThrow(() -> new ArtistNotFoundException("Artist tidak ditemukan dengan ID: " + artistId));
        return albumRepository.findByArtist(artist);
    }

    // ==================== CREATE OPERATION ====================

    @Transactional
    public Album createAlbum(String title, String artistId, int releaseYear, List<String> genreNames) {
        Artist artist = artistRepository.findById(artistId)
            .orElseThrow(() -> new ArtistNotFoundException("Artist tidak ditemukan dengan ID: " + artistId));

        Album album = new Album(title, artist, releaseYear);

        if (genreNames != null && !genreNames.isEmpty()) {
            List<Genre> genres = genreNames.stream()
                .map(name -> genreRepository.findByName(name)
                    .orElseThrow(() -> new GenreNotFoundException("Genre tidak ditemukan: " + name)))
                .collect(Collectors.toList());
            album.setGenres(genres);
        }

        return albumRepository.save(album);
    }

    // ==================== UPDATE OPERATIONS ====================

    @Transactional
    public Album updateAlbum(String albumId, String newTitle, Integer newReleaseYear) {
        Album album = getAlbumById(albumId);

        if (newTitle != null && !newTitle.trim().isEmpty()) {
            album.setTitle(newTitle);
        }

        if (newReleaseYear != null) {
            album.setReleaseYear(newReleaseYear);
        }

        return albumRepository.save(album);
    }

    /**
     * Tambah lagu ke album
     */
    @Transactional
    public Album addSongToAlbum(String albumId, String songId) {
        Album album = getAlbumById(albumId);
        Song song = songRepository.findById(songId)
            .orElseThrow(() -> new IllegalArgumentException("Song not found with ID: " + songId));

        // Ambil artistId masing-masing (aman terhadap null)
        String albumArtistId = album.getArtist() != null ? album.getArtist().getArtistId() : null;
        String songArtistId  = song.getArtist()  != null ? song.getArtist().getArtistId()  : null;

        // Debug log (optional)
        System.out.println("[AlbumService.addSongToAlbum] albumId=" + albumId +
            ", songId=" + songId);
        System.out.println("[AlbumService.addSongToAlbum] albumArtistId=" + albumArtistId +
            ", albumArtistName=" + (album.getArtist() != null ? album.getArtist().getArtistName() : "null"));
        System.out.println("[AlbumService.addSongToAlbum] songArtistId=" + songArtistId +
            ", songArtistName=" + (song.getArtist() != null ? song.getArtist().getArtistName() : "null"));

        // ✅ Validasi yang benar: bandingkan artistId, bukan equals() object
        if (albumArtistId != null && songArtistId != null &&
            !songArtistId.equals(albumArtistId)) {

            throw new IllegalArgumentException(
                "Song artist does not match album artist. Song: " +
                song.getArtist().getArtistName() + ", Album: " +
                album.getArtist().getArtistName()
            );
        }

        album.addSong(song);
        return albumRepository.save(album);
    }

    @Transactional
    public Album removeSongFromAlbum(String albumId, String songId) {
        Album album = getAlbumById(albumId);
        Song song = songRepository.findById(songId)
            .orElseThrow(() -> new IllegalArgumentException("Song not found with ID: " + songId));

        album.removeSong(song);
        return albumRepository.save(album);
    }

    // ==================== DELETE OPERATION ====================

    @Transactional
    public void deleteAlbum(String albumId) {
        Album album = getAlbumById(albumId);
        albumRepository.delete(album);
    }

    // ==================== SEARCH & FILTER OPERATIONS ====================

    @Transactional(readOnly = true)
    public List<Album> searchByTitle(String title) {
        if (title == null || title.trim().isEmpty()) {
            return List.of();
        }
        return albumRepository.findByTitleContainingIgnoreCase(title.trim());
    }

    /**
     * Search album by title OR artist name (comprehensive search)
     * Digunakan untuk general search dari user
     */
    @Transactional(readOnly = true)
    public List<Album> searchByTitleOrArtist(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return List.of();
        }
        
        String trimmedKeyword = keyword.trim();
        
        // Search by title
        List<Album> albumsByTitle = albumRepository.findByTitleContainingIgnoreCase(trimmedKeyword);
        
        // Search by artist name
        List<Album> albumsByArtist = albumRepository.findAll().stream()
            .filter(album -> album.getArtist() != null && 
                   album.getArtist().getArtistName() != null &&
                   album.getArtist().getArtistName().toLowerCase().contains(trimmedKeyword.toLowerCase()))
            .toList();
        
        // Combine results and remove duplicates
        return Stream.concat(albumsByTitle.stream(), albumsByArtist.stream())
            .distinct()
            .toList();
    }

    @Transactional(readOnly = true)
    public List<Album> filterByGenre(String genreName) {
        if (genreName == null || genreName.trim().isEmpty()) {
            return List.of();
        }
        return albumRepository.findByGenres_NameIgnoreCase(genreName.trim());
    }

    @Transactional(readOnly = true)
    public List<Album> filterByReleaseYear(int year) {
        if (year < 1900 || year > 2100) {
            throw new IllegalArgumentException("Invalid year: " + year);
        }
        return albumRepository.findByReleaseYear(year);
    }

    @Transactional(readOnly = true)
    public List<Album> searchAlbums(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllAlbums();
        }

        String searchTerm = keyword.trim().toLowerCase();
        return albumRepository.findAll().stream()
            .filter(album -> album.search(searchTerm))
            .collect(Collectors.toList());
    }

    // ==================== STATISTICS ====================

    @Transactional(readOnly = true)
    public long getTotalAlbums() {
        return albumRepository.count();
    }

    @Transactional(readOnly = true)
    public int getTotalSongsInAlbum(String albumId) {
        Album album = getAlbumById(albumId);
        return album.getTotalSongs(); // pakai getter yang sudah ada
    }

    @Transactional(readOnly = true)
    public boolean albumExists(String albumId) {
        return albumRepository.existsById(albumId);
    }
}
