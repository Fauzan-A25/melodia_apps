package melodia.controller.exception.music;

import org.springframework.http.HttpStatus;
import melodia.controller.exception.ApiException;

/**
 * Exception ketika genre tidak ditemukan
 */
public class GenreNotFoundException extends ApiException {

    public GenreNotFoundException(String genreId) {
        super(
            String.format("Genre dengan ID '%s' tidak ditemukan", genreId),
            HttpStatus.NOT_FOUND,
            "GENRE_NOT_FOUND"
        );
    }
}
