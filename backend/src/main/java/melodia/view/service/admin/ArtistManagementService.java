package melodia.view.service.admin;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import melodia.model.entity.Album;
import melodia.model.entity.Artist;
import melodia.model.entity.Song;
import melodia.model.repository.AlbumRepository;
import melodia.model.repository.ArtistRepository;
import melodia.model.repository.SongRepository;

@Service
public class ArtistManagementService {

    @Autowired
    private ArtistRepository artistRepository;

    @Autowired
    private AlbumRepository albumRepository;

    @Autowired
    private SongRepository songRepository;

    // ==================== CRUD Artist Metadata ====================

    /**
     * Ambil semua artist metadata
     */
    public List<Artist> getAllArtists() {
        return artistRepository.findAll();
    }

    /**
     * Ambil artist metadata by ID
     */
    public Artist getArtistById(String artistId) {
        return artistRepository.findById(artistId)
                .orElseThrow(() -> new IllegalArgumentException("Artist tidak ditemukan"));
    }

    /**
     * Buat artist metadata baru (Admin only)
     */
    @Transactional
    public Artist createArtist(String artistName, String bio) {
        if (artistRepository.existsByArtistName(artistName)) {
            throw new IllegalArgumentException("Nama artist sudah digunakan");
        }

        Artist artist = new Artist(artistName, bio);
        return artistRepository.save(artist);
    }

    /**
     * Update artist metadata (nama, bio)
     */
    @Transactional
    public Artist updateArtist(String artistId, String artistName, String bio) {
        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new IllegalArgumentException("Artist tidak ditemukan"));

        if (artistName != null && !artistName.equals(artist.getArtistName())) {
            if (artistRepository.existsByArtistName(artistName)) {
                throw new IllegalArgumentException("Nama artist sudah digunakan");
            }
            artist.setArtistName(artistName);
        }

        if (bio != null) {
            artist.setBio(bio);
        }

        return artistRepository.save(artist);
    }

    /**
     * Hapus artist metadata (jika tidak punya lagu/album)
     */
    @Transactional
    public void deleteArtist(String artistId) {
        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new IllegalArgumentException("Artist tidak ditemukan"));

        if (!artist.getSongs().isEmpty()) {
            throw new IllegalStateException("Tidak dapat menghapus artist yang masih punya lagu");
        }

        List<Album> albums = albumRepository.findByArtist(artist);
        if (!albums.isEmpty()) {
            throw new IllegalStateException("Tidak dapat menghapus artist yang masih punya album");
        }

        artistRepository.delete(artist);
    }

    // ==================== Artist Statistics ====================

    /**
     * Get semua lagu yang terkait dengan artist
     */
    public List<Song> getArtistSongs(String artistId) {
        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new IllegalArgumentException("Artist tidak ditemukan"));
        return artist.getSongs();
    }

    /**
     * Get semua album milik artist
     */
    public List<Album> getArtistAlbums(String artistId) {
        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new IllegalArgumentException("Artist tidak ditemukan"));
        return albumRepository.findByArtist(artist);
    }

    /**
     * Cari artist berdasarkan nama
     */
    public List<Artist> searchArtists(String keyword) {
        return artistRepository.findByArtistNameContainingIgnoreCase(keyword);
    }

    // ==================== Song/Album Management (untuk maintenance) ====================

    /**
     * Reassign song ke artist lain (maintenance)
     */
    @Transactional
    public void reassignSong(String songId, String newArtistId) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new IllegalArgumentException("Song tidak ditemukan"));

        Artist newArtist = artistRepository.findById(newArtistId)
                .orElseThrow(() -> new IllegalArgumentException("Artist tidak ditemukan"));

        if (song.getArtist() != null) {
            song.getArtist().removeSong(song);
        }

        newArtist.addSong(song);
        song.setArtist(newArtist);

        songRepository.save(song);
        artistRepository.save(newArtist);
    }
}
