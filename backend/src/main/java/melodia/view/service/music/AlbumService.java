package melodia.view.service.music;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    // Ambil semua album
    public List<Album> getAllAlbums() {
        return albumRepository.findAll();
    }

    // Ambil album berdasarkan ID
    public Album getAlbumById(String albumId) {
        return albumRepository.findById(albumId).orElse(null);
    }

    // Buat album baru
    public Album createAlbum(String title, String artistId, int releaseYear, List<String> genreNames) {
        Artist artist = artistRepository.findById(artistId)
            .orElseThrow(() -> new IllegalArgumentException("Artist tidak ditemukan"));

        Album album = new Album(title, artist, releaseYear);
        album.setAlbumId("ALB" + System.currentTimeMillis());

        // Set genres
        if (genreNames != null && !genreNames.isEmpty()) {
            List<Genre> genres = genreNames.stream()
                .map(name -> genreRepository.findByName(name).orElse(null))
                .filter(genre -> genre != null)
                .toList();
            album.setGenres(genres);
        }

        return albumRepository.save(album);
    }

    // Update album
    public Album updateAlbum(String albumId, String newTitle, Integer newReleaseYear) {
        Album album = albumRepository.findById(albumId)
            .orElseThrow(() -> new IllegalArgumentException("Album tidak ditemukan"));

        if (newTitle != null) album.setTitle(newTitle);
        if (newReleaseYear != null) album.setReleaseYear(newReleaseYear);

        return albumRepository.save(album);
    }

    // Hapus album
    public void deleteAlbum(String albumId) {
        Album album = albumRepository.findById(albumId).orElse(null);
        if (album != null) {
            albumRepository.delete(album);
        }
    }

    // Tambah lagu ke album
    public void addSongToAlbum(String albumId, String songId) {
        Album album = albumRepository.findById(albumId)
            .orElseThrow(() -> new IllegalArgumentException("Album tidak ditemukan"));
        Song song = songRepository.findById(songId)
            .orElseThrow(() -> new IllegalArgumentException("Song tidak ditemukan"));

        album.addSong(song);
        albumRepository.save(album);
    }

    // Hapus lagu dari album
    public void removeSongFromAlbum(String albumId, String songId) {
        Album album = albumRepository.findById(albumId)
            .orElseThrow(() -> new IllegalArgumentException("Album tidak ditemukan"));
        Song song = songRepository.findById(songId).orElse(null);

        if (song != null) {
            album.removeSong(song);
            albumRepository.save(album);
        }
    }

    // Ambil semua lagu dalam album
    public List<Song> getAlbumSongs(String albumId) {
        Album album = getAlbumById(albumId);
        return album != null ? album.getSongs() : List.of();
    }

    // Ambil semua album milik artist
    public List<Album> getAlbumsByArtist(String artistId) {
        Artist artist = artistRepository.findById(artistId).orElse(null);
        return artist != null ? albumRepository.findByArtist(artist) : List.of();
    }

    // Search album berdasarkan title
    public List<Album> searchByTitle(String title) {
        return albumRepository.findByTitleContainingIgnoreCase(title);
    }

    // Filter album berdasarkan genre
    public List<Album> filterByGenre(String genreName) {
        return albumRepository.findByGenres_NameIgnoreCase(genreName);
    }

    // Filter album berdasarkan tahun rilis
    public List<Album> filterByReleaseYear(int year) {
        return albumRepository.findByReleaseYear(year);
    }
}
