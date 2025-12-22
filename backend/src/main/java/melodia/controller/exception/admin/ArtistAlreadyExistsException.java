package melodia.controller.exception.admin;

import org.springframework.http.HttpStatus;
import melodia.controller.exception.ApiException;

/**
 * Exception ketika artist sudah ada (duplicate)
 */
public class ArtistAlreadyExistsException extends ApiException {

    public ArtistAlreadyExistsException(String artistName) {
        super(
            String.format("Artist '%s' sudah ada", artistName),
            HttpStatus.CONFLICT,
            "ARTIST_ALREADY_EXISTS"
        );
    }
}
