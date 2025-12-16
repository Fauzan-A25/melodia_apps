package melodia.model.service.strategy;

import java.util.List;
import java.util.Random;

import melodia.model.entity.Song;

public class ShufflePlayback implements PlaybackStrategy {
    private final Random random = new Random();

    @Override
    public Song getNextSong(List<Song> queue, int currentIndex) {
        if (queue == null || queue.isEmpty()) return null;
        return queue.get(random.nextInt(queue.size()));
    }

    @Override
    public Song getPreviousSong(List<Song> queue, int currentIndex) {
        // Bisa diimplementasikan sama seperti getNextSong,
        // atau mengatur history shuffle jika ingin.
        return this.getNextSong(queue, currentIndex);
    }
}
