package melodia.model.service.music;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import melodia.controller.exception.music.SongNotFoundException;
import melodia.model.entity.Album;
import melodia.model.entity.History;
import melodia.model.entity.Playlist;
import melodia.model.entity.Song;
import melodia.model.repository.AlbumRepository;
import melodia.model.repository.HistoryRepository;
import melodia.model.repository.PlaylistRepository;
import melodia.model.repository.SongRepository;

@Service
public class SongDeletionService {

    private static final Logger logger = LoggerFactory.getLogger(SongDeletionService.class);

    @Autowired
    private SongRepository songRepository;

    @Autowired
    private HistoryRepository historyRepository;

    @Autowired
    private PlaylistRepository playlistRepository;

    @Autowired
    private AlbumRepository albumRepository;

    @Autowired
    private FileStorageService fileStorageService;

    /**
     * Hapus lagu beserta semua referensinya (manual melalui relasi entity)
     */
    @Transactional
    public void deleteSongWithReferences(String songId) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new SongNotFoundException("Lagu tidak ditemukan: " + songId));

        logger.info("Deleting song {} with all references", songId);

        // 1. Lepaskan dari History (ManyToMany: histories.playedSongs -> history_songs)
        List<History> histories = historyRepository.findAll();
        int historyTouched = 0;
        for (History h : histories) {
            boolean removed = h.getPlayedSongs()
                    .removeIf(s -> songId.equals(s.getSongId()));
            if (removed) {
                historyTouched++;
            }
        }
        if (historyTouched > 0) {
            historyRepository.saveAll(histories);
        }
        logger.info("Removed song from {} history records", historyTouched);

        // 2. Lepaskan dari semua playlist yang mengandung song
        List<Playlist> playlists = playlistRepository.findBySongsContaining(song);
        for (Playlist p : playlists) {
            p.getSongs().remove(song);
        }
        if (!playlists.isEmpty()) {
            playlistRepository.saveAll(playlists);
        }
        logger.info("Removed song from {} playlists", playlists.size());

        // 3. Lepaskan dari semua album yang mengandung song
        List<Album> albums = albumRepository.findAll().stream()
                .filter(a -> a.getSongs().contains(song))
                .toList();
        for (Album a : albums) {
            a.getSongs().remove(song);
        }
        if (!albums.isEmpty()) {
            albumRepository.saveAll(albums);
        }
        logger.info("Removed song from {} albums", albums.size());

        // 4. Hapus file audio dari storage
        try {
            fileStorageService.deleteFile(song.getFilePath());
        } catch (Exception e) {
            logger.warn("Could not delete file from storage: {}", e.getMessage());
        }

        // 5. Hapus song dari database
        songRepository.delete(song);
        logger.info("Song {} deleted successfully", songId);
    }
}
