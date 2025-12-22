package melodia.controller.exception.auth;

import org.springframework.http.HttpStatus;
import melodia.controller.exception.ApiException;

/**
 * Exception ketika account (username/email) sudah terdaftar
 */
public class AccountAlreadyExistsException extends ApiException {

    public AccountAlreadyExistsException(String fieldName, String value) {
        super(
            String.format("%s '%s' sudah terdaftar", fieldName, value),
            HttpStatus.CONFLICT,
            "ACCOUNT_ALREADY_EXISTS"
        );
    }
}
