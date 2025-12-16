package melodia.model.service.strategy;

import melodia.model.entity.Song;
import java.util.List;

public class SequentialPlayback implements PlaybackStrategy {
    @Override
    public Song getNextSong(List<Song> queue, int currentIndex) {
        if (queue == null || queue.isEmpty()) return null;
        int nextIndex = (currentIndex + 1) % queue.size();
        return queue.get(nextIndex);
    }

    @Override
    public Song getPreviousSong(List<Song> queue, int currentIndex) {
        if (queue == null || queue.isEmpty()) return null;
        int prevIndex = (currentIndex - 1 + queue.size()) % queue.size();
        return queue.get(prevIndex);
    }
}
