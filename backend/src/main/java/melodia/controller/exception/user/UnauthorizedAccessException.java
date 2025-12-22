package melodia.controller.exception.user;

import org.springframework.http.HttpStatus;
import melodia.controller.exception.ApiException;

/**
 * Exception untuk unauthorized access ke resource tertentu
 */
public class UnauthorizedAccessException extends ApiException {

    public UnauthorizedAccessException(String resource) {
        super(
            String.format("Anda tidak memiliki akses ke %s", resource),
            HttpStatus.FORBIDDEN,
            "UNAUTHORIZED_ACCESS"
        );
    }
}
