package melodia.controller.exception.user;

import org.springframework.http.HttpStatus;
import melodia.controller.exception.ApiException;

/**
 * Exception ketika user tidak ditemukan
 */
public class UserNotFoundException extends ApiException {

    public UserNotFoundException(String userId) {
        super(
            String.format("User dengan ID '%s' tidak ditemukan", userId),
            HttpStatus.NOT_FOUND,
            "USER_NOT_FOUND"
        );
    }
}
