package melodia.controller.exception.music;

import org.springframework.http.HttpStatus;
import melodia.controller.exception.ApiException;

/**
 * Exception ketika song sudah ada (duplicate)
 */
public class SongAlreadyExistsException extends ApiException {

    public SongAlreadyExistsException(String title) {
        super(
            String.format("Song '%s' sudah ada", title),
            HttpStatus.CONFLICT,
            "SONG_ALREADY_EXISTS"
        );
    }
}
