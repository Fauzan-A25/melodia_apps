package melodia.controller.exception.admin;

import org.springframework.http.HttpStatus;
import melodia.controller.exception.ApiException;

/**
 * Exception ketika artist tidak ditemukan
 */
public class ArtistNotFoundException extends ApiException {

    public ArtistNotFoundException(String artistId) {
        super(
            String.format("Artist dengan ID '%s' tidak ditemukan", artistId),
            HttpStatus.NOT_FOUND,
            "ARTIST_NOT_FOUND"
        );
    }
}
