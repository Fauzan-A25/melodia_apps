package melodia.controller.exception.admin;

import org.springframework.http.HttpStatus;
import melodia.controller.exception.ApiException;

/**
 * Exception untuk invalid operation atau business rule violation
 */
public class InvalidOperationException extends ApiException {

    public InvalidOperationException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "INVALID_OPERATION");
    }
}
