package melodia.controller.exception.auth;

import org.springframework.http.HttpStatus;
import melodia.controller.exception.ApiException;

/**
 * Exception untuk token invalid/expired atau authorization error
 */
public class UnauthorizedException extends ApiException {

    public UnauthorizedException() {
        super("Token tidak valid atau sudah expired", HttpStatus.FORBIDDEN, "UNAUTHORIZED");
    }
}
