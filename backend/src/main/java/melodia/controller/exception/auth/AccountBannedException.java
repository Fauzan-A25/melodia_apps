package melodia.controller.exception.auth;

import org.springframework.http.HttpStatus;

import melodia.controller.exception.ApiException;

/**
 * Exception untuk akun yang di-ban dan tidak diizinkan untuk login
 */
public class AccountBannedException extends ApiException {

    public AccountBannedException(String banReason) {
        super(
            "Akun Anda telah di-ban. Alasan: " + (banReason != null ? banReason : "Tidak ada alasan yang diberikan"),
            HttpStatus.FORBIDDEN,
            "ACCOUNT_BANNED"
        );
    }

    public AccountBannedException() {
        super(
            "Akun Anda telah di-ban dan tidak diizinkan untuk login",
            HttpStatus.FORBIDDEN,
            "ACCOUNT_BANNED"
        );
    }
}
