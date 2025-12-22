package melodia.model.service.music;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import melodia.controller.exception.admin.ArtistNotFoundException;
import melodia.controller.exception.music.SongAlreadyExistsException;
import melodia.controller.exception.music.SongNotFoundException;
import melodia.model.entity.Artist;
import melodia.model.entity.Genre;
import melodia.model.entity.Song;
import melodia.model.repository.ArtistRepository;
import melodia.model.repository.GenreRepository;
import melodia.model.repository.SongRepository;

@Service
public class MusicService {

    @Autowired
    private SongRepository songRepository;

    @Autowired
    private GenreRepository genreRepository;

    @Autowired
    private ArtistRepository artistRepository;

    // Ambil semua lagu
    public List<Song> getAllSongs() {
        return songRepository.findAll();
    }

    // Ambil lagu berdasarkan ID
    public Song getSongById(String songId) {
        return songRepository.findById(songId).orElse(null);
    }

    /**
     * Upload/create lagu baru (VERSI BARU, pakai artistId + genreIds).
     * Catatan: sekarang upload utama ada di AdminSongController,
     * method ini bisa dipakai internal kalau mau.
     */
    public Song createSong(
            String title,
            String artistId,
            String filePath,
            List<String> genreIds,
            int duration,
            int releaseYear
    ) {
        if (songRepository.existsByTitle(title)) {
            throw new SongAlreadyExistsException("Lagu dengan judul ini sudah ada");
        }

        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new ArtistNotFoundException("Artist tidak ditemukan: " + artistId));

        Song song = new Song();
        song.setSongId("SNG" + System.currentTimeMillis());
        song.setTitle(title);
        song.setArtist(artist);
        song.setFilePath(filePath);
        song.setDuration(duration);
        song.setReleaseYear(releaseYear);
        song.setUploadedAt(LocalDateTime.now());

        // Tambahkan genre dari list ID genre
        if (genreIds != null && !genreIds.isEmpty()) {
            List<Genre> genres = genreIds.stream()
                    .map(id -> genreRepository.findById(id).orElse(null))
                    .filter(g -> g != null)
                    .toList();
            song.setGenres(genres);
        }

        return songRepository.save(song);
    }

    // Update lagu (tanpa artistName string lagi)
    public Song updateSong(
            String songId,
            String newTitle,
            String newArtistId,
            Integer newDuration,
            Integer newReleaseYear
    ) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new SongNotFoundException("Lagu tidak ditemukan"));

        if (newTitle != null) {
            song.setTitle(newTitle);
        }

        if (newArtistId != null) {
            Artist artist = artistRepository.findById(newArtistId)
                    .orElseThrow(() -> new ArtistNotFoundException("Artist tidak ditemukan: " + newArtistId));
            song.setArtist(artist);
        }

        if (newDuration != null) {
            song.setDuration(newDuration);
        }

        if (newReleaseYear != null) {
            song.setReleaseYear(newReleaseYear);
        }

        return songRepository.save(song);
    }

    // Hapus lagu
    public void deleteSong(String songId) {
        songRepository.findById(songId).ifPresent(songRepository::delete);
    }

    // Search lagu berdasarkan judul
    public List<Song> searchByTitle(String title) {
        return songRepository.findByTitleContainingIgnoreCase(title);
    }

    // Search lagu berdasarkan artist (pakai relasi Artist.name)
    public List<Song> searchByArtist(String artistName) {
        return songRepository.findByArtist_ArtistNameContainingIgnoreCase(artistName);
        // pastikan di SongRepository sudah ada:
        // List<Song> findByArtist_ArtistNameContainingIgnoreCase(String artistName);
    }

    // Filter lagu berdasarkan genre (pakai relasi Genre.name)
    public List<Song> filterByGenre(String genreName) {
        return songRepository.findByGenres_NameIgnoreCase(genreName);
        // pastikan di SongRepository sudah ada:
        // List<Song> findByGenres_NameIgnoreCase(String name);
    }

    // Filter lagu berdasarkan tahun rilis
    public List<Song> filterByReleaseYear(int year) {
        return songRepository.findByReleaseYear(year);
    }

    // Cek apakah lagu sudah ada (duplicate check)
    public boolean isSongExists(String title) {
        return songRepository.existsByTitle(title);
    }
}
