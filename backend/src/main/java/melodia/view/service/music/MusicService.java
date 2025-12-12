package melodia.view.service.music;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import melodia.model.entity.Genre;
import melodia.model.entity.Song;
import melodia.model.repository.GenreRepository;
import melodia.model.repository.SongRepository;

@Service
public class MusicService {

    @Autowired
    private SongRepository songRepository;

    @Autowired
    private GenreRepository genreRepository;

    // Ambil semua lagu
    public List<Song> getAllSongs() {
        return songRepository.findAll();
    }

    // Ambil lagu berdasarkan ID
    public Song getSongById(String songId) {
        return songRepository.findById(songId).orElse(null);
    }

    // Upload/create lagu baru
    public Song createSong(String title, String artistName, String filePath, List<String> genreNames, int duration, int releaseYear) {
        if (songRepository.existsByTitle(title)) {
            throw new IllegalArgumentException("Lagu dengan judul ini sudah ada");
        }

        Song song = new Song(title, artistName, filePath, null);
        song.setSongId("SNG" + System.currentTimeMillis());
        song.setDuration(duration);
        song.setReleaseYear(releaseYear);
        song.setUploadedAt(LocalDateTime.now());

        // Tambahkan genre dari list nama genre
        if (genreNames != null && !genreNames.isEmpty()) {
            List<Genre> genres = genreNames.stream()
                .map(name -> genreRepository.findByName(name).orElse(null))
                .filter(genre -> genre != null)
                .toList();
            song.setGenres(genres);
        }

        return songRepository.save(song);
    }

    // Update lagu
    public Song updateSong(String songId, String newTitle, String newArtistName, Integer newDuration, Integer newReleaseYear) {
        Song song = songRepository.findById(songId).orElseThrow(() -> new IllegalArgumentException("Lagu tidak ditemukan"));
        
        if (newTitle != null) song.setTitle(newTitle);
        if (newArtistName != null) song.setArtistName(newArtistName);
        if (newDuration != null) song.setDuration(newDuration);
        if (newReleaseYear != null) song.setReleaseYear(newReleaseYear);

        return songRepository.save(song);
    }

    // Hapus lagu
    public void deleteSong(String songId) {
        Song song = songRepository.findById(songId).orElse(null);
        if (song != null) {
            songRepository.delete(song);
        }
    }

    // Search lagu berdasarkan judul
    public List<Song> searchByTitle(String title) {
        return songRepository.findByTitleContainingIgnoreCase(title);
    }

    // Search lagu berdasarkan artist
    public List<Song> searchByArtist(String artistName) {
        return songRepository.findByArtistNameContainingIgnoreCase(artistName);
    }

    // Filter lagu berdasarkan genre
    public List<Song> filterByGenre(String genreName) {
        return songRepository.findByGenres_NameIgnoreCase(genreName);
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
