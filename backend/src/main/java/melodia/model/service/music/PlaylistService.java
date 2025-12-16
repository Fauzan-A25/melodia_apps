package melodia.model.service.music;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import melodia.model.entity.Playlist;
import melodia.model.entity.Song;
import melodia.model.entity.User;
import melodia.model.repository.PlaylistRepository;
import melodia.model.repository.SongRepository;
import melodia.model.repository.UserRepository;

@Service
public class PlaylistService {

    @Autowired
    private PlaylistRepository playlistRepository;

    @Autowired
    private SongRepository songRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Create new playlist
     */
    @Transactional
    public Playlist createPlaylist(String userId, String name, String description) {
        User owner = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Playlist playlist = new Playlist(name, owner);
        playlist.setPlaylistId("PL-" + UUID.randomUUID().toString());
        playlist.setDescription(description);
        playlist.setCreatedAt(LocalDateTime.now());

        return playlistRepository.save(playlist);
    }

    /**
     * Get all playlists by user
     */
    public List<Playlist> getUserPlaylists(String userId) {
        User owner = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return playlistRepository.findByOwner(owner);
    }

    /**
     * Get playlist by ID
     */
    public Playlist getPlaylistById(String playlistId) {
        return playlistRepository.findById(playlistId)
            .orElseThrow(() -> new RuntimeException("Playlist not found"));
    }

    /**
     * Update playlist details (name, description)
     */
    @Transactional
    public Playlist updatePlaylist(String playlistId, String userId, String name, String description) {
        Playlist playlist = playlistRepository.findById(playlistId)
            .orElseThrow(() -> new RuntimeException("Playlist not found"));

        // Check ownership
        if (!playlist.getOwner().getAccountId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only update your own playlists");
        }

        if (name != null && !name.isEmpty()) {
            playlist.setName(name);
        }
        if (description != null) {
            playlist.setDescription(description);
        }

        return playlistRepository.save(playlist);
    }

    /**
     * Delete playlist
     */
    @Transactional
    public void deletePlaylist(String playlistId, String userId) {
        Playlist playlist = playlistRepository.findById(playlistId)
            .orElseThrow(() -> new RuntimeException("Playlist not found"));

        // Check ownership
        if (!playlist.getOwner().getAccountId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own playlists");
        }

        playlistRepository.delete(playlist);
    }

    /**
     * Add song to playlist
     */
    @Transactional
    public Playlist addSongToPlaylist(String playlistId, String songId, String userId) {
        Playlist playlist = playlistRepository.findById(playlistId)
            .orElseThrow(() -> new RuntimeException("Playlist not found"));

        // Check ownership
        if (!playlist.getOwner().getAccountId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only modify your own playlists");
        }

        Song song = songRepository.findById(songId)
            .orElseThrow(() -> new RuntimeException("Song not found"));

        playlist.addSong(song);
        return playlistRepository.save(playlist);
    }

    /**
     * Remove song from playlist
     */
    @Transactional
    public Playlist removeSongFromPlaylist(String playlistId, String songId, String userId) {
        Playlist playlist = playlistRepository.findById(playlistId)
            .orElseThrow(() -> new RuntimeException("Playlist not found"));

        // Check ownership
        if (!playlist.getOwner().getAccountId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only modify your own playlists");
        }

        Song song = songRepository.findById(songId)
            .orElseThrow(() -> new RuntimeException("Song not found"));

        playlist.removeSong(song);
        return playlistRepository.save(playlist);
    }

    /**
     * Search playlists by name
     */
    public List<Playlist> searchPlaylistsByName(String query) {
        return playlistRepository.findByNameContainingIgnoreCase(query);
    }

    /**
     * Get all songs in a playlist
     */
    public List<Song> getPlaylistSongs(String playlistId) {
        Playlist playlist = playlistRepository.findById(playlistId)
            .orElseThrow(() -> new RuntimeException("Playlist not found"));
        return playlist.getSongs();
    }
}
