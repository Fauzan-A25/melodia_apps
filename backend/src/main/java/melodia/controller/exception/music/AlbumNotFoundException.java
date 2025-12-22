package melodia.controller.exception.music;

import org.springframework.http.HttpStatus;
import melodia.controller.exception.ApiException;

/**
 * Exception ketika album tidak ditemukan
 */
public class AlbumNotFoundException extends ApiException {

    public AlbumNotFoundException(String albumId) {
        super(
            String.format("Album dengan ID '%s' tidak ditemukan", albumId),
            HttpStatus.NOT_FOUND,
            "ALBUM_NOT_FOUND"
        );
    }
}
