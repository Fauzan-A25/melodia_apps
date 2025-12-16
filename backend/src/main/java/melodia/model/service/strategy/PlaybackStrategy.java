package melodia.model.service.strategy;

import melodia.model.entity.Song;
import java.util.List;

public interface PlaybackStrategy {
    Song getNextSong(List<Song> queue, int currentIndex);
    Song getPreviousSong(List<Song> queue, int currentIndex);
}
