package melodia.model.service.user;

import melodia.model.entity.Song;
import melodia.model.repository.SongRepository;
import melodia.model.service.strategy.PlaybackStrategy;
import melodia.model.service.strategy.SequentialPlayback;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PlayerService {

    @Autowired
    private SongRepository songRepository;

    private Song currentSong;
    private List<Song> queue;
    private int currentIndex = -1;
    private PlaybackState playbackState = PlaybackState.STOPPED;

    // Default playback strategy
    private PlaybackStrategy playbackStrategy = new SequentialPlayback();

    public enum PlaybackState {
        PLAYING,
        PAUSED,
        STOPPED
    }

    // Setter untuk ganti strategi playback (shuffle, repeat, dsb)
    public void setPlaybackStrategy(PlaybackStrategy strategy) {
        if (strategy != null) this.playbackStrategy = strategy;
    }

    // Memulai pemutaran lagu tertentu (by id)
    public void playSong(String songId) {
        Song song = songRepository.findById(songId).orElseThrow(() -> new IllegalArgumentException("Song tidak ditemukan"));
        currentSong = song;
        playbackState = PlaybackState.PLAYING;
        if (queue != null) currentIndex = queue.indexOf(song);
        // Integrasi streaming/file handler audio dilakukan di layer lain (opsional)
    }

    // Pause pemutaran
    public void pause() {
        if (currentSong == null) throw new IllegalStateException("Tidak ada lagu yang sedang diputar");
        playbackState = PlaybackState.PAUSED;
    }

    // Lanjutkan pemutaran
    public void resume() {
        if (currentSong == null) throw new IllegalStateException("Tidak ada lagu yang sedang diputar");
        playbackState = PlaybackState.PLAYING;
    }

    // Stop pemutaran
    public void stop() {
        playbackState = PlaybackState.STOPPED;
        currentSong = null;
        currentIndex = -1;
    }

    // Set antrian lagu
    public void setQueue(List<String> songIds) {
        queue = songRepository.findAllById(songIds);
        currentIndex = !queue.isEmpty() ? 0 : -1;
        currentSong = (currentIndex >= 0) ? queue.get(currentIndex) : null;
    }

    // Pemutaran lagu berikutnya (pakai strategy)
    public void next() {
        if (queue == null || queue.isEmpty()) throw new IllegalStateException("Queue kosong");
        Song nextSong = playbackStrategy.getNextSong(queue, currentIndex);
        if (nextSong != null) {
            currentIndex = queue.indexOf(nextSong);
            currentSong = nextSong;
            playbackState = PlaybackState.PLAYING;
        }
    }

    // Pemutaran lagu sebelumnya (strategy)
    public void previous() {
        if (queue == null || queue.isEmpty()) throw new IllegalStateException("Queue kosong");
        Song prevSong = playbackStrategy.getPreviousSong(queue, currentIndex);
        if (prevSong != null) {
            currentIndex = queue.indexOf(prevSong);
            currentSong = prevSong;
            playbackState = PlaybackState.PLAYING;
        }
    }

    // Dapatkan lagu yang sedang diputar
    public Song getCurrentSong() {
        return currentSong;
    }

    // Dapatkan status player
    public PlaybackState getPlaybackState() {
        return playbackState;
    }
}
