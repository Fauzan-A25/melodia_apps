package melodia.model.service.artist;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import melodia.model.entity.Artist;
import melodia.model.repository.ArtistRepository;

@Service
public class ArtistService {

    private final ArtistRepository artistRepository;

    public ArtistService(ArtistRepository artistRepository) {
        this.artistRepository = artistRepository;
    }

    // ==================== Create Artist (metadata) ====================

    @Transactional
    public Artist createArtist(String artistName, String bio) {
        if (artistRepository.existsByArtistName(artistName)) {
            throw new IllegalArgumentException("Nama artist sudah digunakan");
        }

        Artist artist = new Artist(artistName, bio);
        return artistRepository.save(artist);
    }

    // ==================== Update Artist ====================

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

    // ==================== Delete Artist ====================

    @Transactional
    public void deleteArtist(String artistId) {
        Artist artist = artistRepository.findById(artistId)
            .orElseThrow(() -> new IllegalArgumentException("Artist tidak ditemukan"));

        if (!artist.getSongs().isEmpty()) {
            throw new IllegalStateException("Tidak dapat menghapus artist yang masih mempunyai lagu");
        }

        artistRepository.delete(artist);
    }

    // ==================== Query Methods ====================

    public Artist getArtistById(String artistId) {
        return artistRepository.findById(artistId)
            .orElseThrow(() -> new IllegalArgumentException("Artist tidak ditemukan"));
    }

    public List<Artist> getAllArtists() {
        return artistRepository.findAll();
    }

    public List<Artist> searchArtistsByName(String keyword) {
        return artistRepository.findByArtistNameContainingIgnoreCase(keyword);
    }

    public boolean isArtistNameExists(String artistName) {
        return artistRepository.existsByArtistName(artistName);
    }
}
