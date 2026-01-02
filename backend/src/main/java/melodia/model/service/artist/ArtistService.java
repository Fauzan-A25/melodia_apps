package melodia.model.service.artist;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import melodia.controller.exception.admin.ArtistAlreadyExistsException;
import melodia.controller.exception.admin.ArtistNotFoundException;
import melodia.controller.exception.admin.InvalidOperationException;
import melodia.model.entity.Album;
import melodia.model.entity.Artist;
import melodia.model.entity.Song;
import melodia.model.repository.AlbumRepository;
import melodia.model.repository.ArtistRepository;
import melodia.model.repository.SongRepository;

@Service
public class ArtistService {

    @Autowired
    private ArtistRepository artistRepository;

    @Autowired
    private AlbumRepository albumRepository;

    @Autowired
    private SongRepository songRepository;

    // ==================== Create Artist (metadata) ====================

    @Transactional
    public Artist createArtist(String artistName, String bio) {
        if (artistRepository.existsByArtistName(artistName)) {
            throw new ArtistAlreadyExistsException("Nama artist sudah digunakan");
        }

        Artist artist = new Artist(artistName, bio);
        return artistRepository.save(artist);
    }

    // ==================== Update Artist ====================

    @Transactional
    public Artist updateArtist(String artistId, String artistName, String bio) {
        Artist artist = artistRepository.findById(artistId)
            .orElseThrow(() -> new ArtistNotFoundException("Artist tidak ditemukan"));

        if (artistName != null && !artistName.equals(artist.getArtistName())) {
            if (artistRepository.existsByArtistName(artistName)) {
                throw new ArtistAlreadyExistsException("Nama artist sudah digunakan");
            }
            artist.setArtistName(artistName);
        }

        if (bio != null) {
            artist.setBio(bio);
        }

        return artistRepository.save(artist);
    }

    // ==================== Delete Artist ====================

    @Transactional
    public void deleteArtist(String artistId) {
        Artist artist = artistRepository.findById(artistId)
            .orElseThrow(() -> new ArtistNotFoundException("Artist tidak ditemukan"));

        if (!artist.getSongs().isEmpty()) {
            throw new InvalidOperationException("Tidak dapat menghapus artist yang masih mempunyai lagu");
        }

        List<Album> albums = albumRepository.findByArtist(artist);
        if (!albums.isEmpty()) {
            throw new InvalidOperationException("Tidak dapat menghapus artist yang masih punya album");
        }

        artistRepository.delete(artist);
    }

    // ==================== Query Methods ====================

    public Artist getArtistById(String artistId) {
        return artistRepository.findById(artistId)
            .orElseThrow(() -> new ArtistNotFoundException("Artist tidak ditemukan"));
    }

    public List<Artist> getAllArtists() {
        return artistRepository.findAll();
    }

    public List<Artist> searchArtistsByName(String keyword) {
        return artistRepository.searchByKeyword(keyword);
    }

    public boolean isArtistNameExists(String artistName) {
        return artistRepository.existsByArtistName(artistName);
    }

    // ==================== Artist Statistics ====================

    /**
     * Get semua lagu yang terkait dengan artist
     */
    public List<Song> getArtistSongs(String artistId) {
        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new ArtistNotFoundException("Artist tidak ditemukan"));
        return artist.getSongs();
    }

    /**
     * Get semua album milik artist
     */
    public List<Album> getArtistAlbums(String artistId) {
        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new ArtistNotFoundException("Artist tidak ditemukan"));
        return albumRepository.findByArtist(artist);
    }

    // ==================== Song/Album Management (untuk maintenance) ====================

    /**
     * Reassign song ke artist lain (admin only)
     */
    @Transactional
    public void reassignSong(String songId, String newArtistId) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ArtistNotFoundException("Song tidak ditemukan"));

        Artist newArtist = artistRepository.findById(newArtistId)
                .orElseThrow(() -> new ArtistNotFoundException("Artist tidak ditemukan"));

        if (song.getArtist() != null) {
            song.getArtist().removeSong(song);
        }

        newArtist.addSong(song);
        song.setArtist(newArtist);

        songRepository.save(song);
        artistRepository.save(newArtist);
    }
}