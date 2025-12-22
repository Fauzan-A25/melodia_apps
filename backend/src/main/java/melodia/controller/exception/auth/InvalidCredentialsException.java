package melodia.controller.exception.auth;

import org.springframework.http.HttpStatus;
import melodia.controller.exception.ApiException;

/**
 * Exception untuk invalid username/password
 */
public class InvalidCredentialsException extends ApiException {

    public InvalidCredentialsException() {
        super("Username atau password salah", HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS");
    }
}
