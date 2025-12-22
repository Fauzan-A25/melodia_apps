package melodia.controller.exception.music;

import org.springframework.http.HttpStatus;
import melodia.controller.exception.ApiException;

/**
 * Exception ketika playlist tidak ditemukan
 */
public class PlaylistNotFoundException extends ApiException {

    public PlaylistNotFoundException(String playlistId) {
        super(
            String.format("Playlist dengan ID '%s' tidak ditemukan", playlistId),
            HttpStatus.NOT_FOUND,
            "PLAYLIST_NOT_FOUND"
        );
    }
}
