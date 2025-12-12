package melodia.view.service.admin;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import melodia.model.entity.Album;
import melodia.model.entity.Artist;
import melodia.model.entity.Song;
import melodia.model.repository.AlbumRepository;
import melodia.model.repository.ArtistRepository;

@Service
public class ArtistManagementService {

    @Autowired
    private ArtistRepository artistRepository;

    @Autowired
    private AlbumRepository albumRepository;

    // Ambil semua artist
    public List<Artist> getAllArtists() {
        return artistRepository.findAll();
    }

    // Ambil artist by id
    public Artist getArtistById(String artistId) {
        return artistRepository.findById(artistId).orElse(null);
    }

    // Update profil artist (bio, username, email)
    public Artist updateArtistProfile(String artistId, String newUsername, String newEmail, String newBio) {
        Artist artist = artistRepository.findById(artistId)
            .orElseThrow(() -> new IllegalArgumentException("Artist tidak ditemukan"));

        if (newUsername != null) artist.setUsername(newUsername);
        if (newEmail != null) artist.setEmail(newEmail);
        if (newBio != null) artist.setBio(newBio);

        return artistRepository.save(artist);
    }

    // Hapus artist (admin only)
    public void deleteArtist(String artistId) {
        Artist artist = artistRepository.findById(artistId).orElse(null);
        if (artist != null) {
            artistRepository.delete(artist);
        }
    }

    // Get semua lagu yang di-upload artist
    public List<Song> getUploadedSongs(String artistId) {
        Artist artist = artistRepository.findById(artistId).orElse(null);
        return artist != null ? artist.getUploadedSongs() : List.of();
    }

    // Get semua album milik artist
    public List<Album> getArtistAlbums(String artistId) {
        Artist artist = artistRepository.findById(artistId).orElse(null);
        return artist != null ? albumRepository.findByArtist(artist) : List.of();
    }

    // Tambah lagu ke artist (upload lagu)
    public void uploadSong(String artistId, Song song) {
        Artist artist = artistRepository.findById(artistId)
            .orElseThrow(() -> new IllegalArgumentException("Artist tidak ditemukan"));
        artist.uploadSong(song);
        artistRepository.save(artist);
    }

    // Hapus lagu dari artist
    public void deleteSong(String artistId, String songId) {
        Artist artist = artistRepository.findById(artistId)
            .orElseThrow(() -> new IllegalArgumentException("Artist tidak ditemukan"));
        artist.deleteSong(songId);
        artistRepository.save(artist);
    }
}
