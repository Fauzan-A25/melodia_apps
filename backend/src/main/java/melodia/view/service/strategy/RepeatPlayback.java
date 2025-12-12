package melodia.view.service.strategy;

import melodia.model.entity.Song;
import java.util.List;

public class RepeatPlayback implements PlaybackStrategy {
    @Override
    public Song getNextSong(List<Song> queue, int currentIndex) {
        if (queue == null || queue.isEmpty() || currentIndex < 0) return null;
        return queue.get(currentIndex); // lagu diulang terus
    }

    @Override
    public Song getPreviousSong(List<Song> queue, int currentIndex) {
        return getNextSong(queue, currentIndex);
    }
}
