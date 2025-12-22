package melodia.controller.exception.music;

import org.springframework.http.HttpStatus;
import melodia.controller.exception.ApiException;

/**
 * Exception ketika song tidak ditemukan
 */
public class SongNotFoundException extends ApiException {

    public SongNotFoundException(String songId) {
        super(
            String.format("Song dengan ID '%s' tidak ditemukan", songId),
            HttpStatus.NOT_FOUND,
            "SONG_NOT_FOUND"
        );
    }
}
