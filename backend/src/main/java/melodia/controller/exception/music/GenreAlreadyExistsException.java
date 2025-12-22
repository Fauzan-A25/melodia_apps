package melodia.controller.exception.music;

import org.springframework.http.HttpStatus;
import melodia.controller.exception.ApiException;

/**
 * Exception ketika genre sudah ada (duplicate)
 */
public class GenreAlreadyExistsException extends ApiException {

    public GenreAlreadyExistsException(String genreName) {
        super(
            String.format("Genre '%s' sudah ada", genreName),
            HttpStatus.CONFLICT,
            "GENRE_ALREADY_EXISTS"
        );
    }
}
