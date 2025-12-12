package melodia.controller.user;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import melodia.model.dto.request.auth.ChangePasswordRequest;
import melodia.model.dto.request.auth.LoginRequest;
import melodia.model.dto.request.auth.RegisterAdminRequest;
import melodia.model.dto.request.auth.RegisterRequest;
import melodia.model.dto.request.auth.UpdateProfileRequest;       
import melodia.model.dto.response.AuthResponse;
import melodia.model.dto.response.ErrorResponse;
import melodia.model.entity.Account;
import melodia.model.entity.Admin;
import melodia.model.entity.User;
import melodia.model.repository.AccountRepository;
import melodia.security.JwtUtil;
import melodia.view.service.auth.AuthenticationService;
import melodia.view.service.auth.RegistrationService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // ==================== Helper ====================

    /**
     * Create AuthResponse tanpa Artist logic (Artist bukan Account lagi)
     */
    private AuthResponse createAuthResponse(String message, Account account) {
        return new AuthResponse(
                message,
                account.getAccountId(),
                account.getUsername(),
                account.getEmail(),
                account.getAccountType()
        );
    }

    private AuthResponse createAuthResponseWithToken(String message, Account account, String token) {
        AuthResponse response = createAuthResponse(message, account);
        response.setToken(token);
        return response;
    }

    // ==================== LOGIN (JWT + AuthenticationService) ====================

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        logger.info("Login attempt for username: {}", request.getUsername());

        try {
            // ✅ Account (User/Admin) saja, Artist sudah bukan akun login
            Account account = authenticationService.login(
                    request.getUsername(),
                    request.getPassword()
            );

            String token = jwtUtil.generateToken(account.getUsername());

            AuthResponse response = createAuthResponseWithToken("Login successful", account, token);

            logger.info("✅ Login successful for user: {}", account.getUsername());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.error("❌ Login failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Login unexpected error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Login failed: " + e.getMessage()));
        }
    }

    // ==================== LOGOUT ====================

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String token) {
        logger.info("Logout attempt");
        // JWT stateless: cukup clear di frontend
        logger.info("✅ Logout successful");
        return ResponseEntity.ok(new AuthMessageResponse("Logout berhasil. Token akan expired otomatis."));
    }

    // ==================== VALIDATE TOKEN ====================

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        logger.debug("Token validation attempt");

        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Token tidak ditemukan"));
            }

            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);

            if (jwtUtil.validateToken(token, username)) {
                Account account = accountRepository.findByUsername(username)
                        .orElseThrow(() -> new IllegalArgumentException("Account not found"));

                AuthResponse response = createAuthResponseWithToken("Token valid", account, token);

                logger.debug("✅ Token valid for user: {}", username);
                return ResponseEntity.ok(response);
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Token tidak valid atau expired"));

        } catch (IllegalArgumentException e) {
            logger.error("❌ Token validation error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Token tidak valid: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Token validation error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Token tidak valid"));
        }
    }

    // ==================== REFRESH TOKEN ====================

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authHeader) {
        logger.info("Token refresh attempt");

        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Token tidak ditemukan"));
            }

            String oldToken = authHeader.substring(7);
            String username = jwtUtil.extractUsername(oldToken);

            Account account = accountRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("Account not found"));

            String newToken = jwtUtil.generateToken(username);

            AuthResponse response = createAuthResponseWithToken("Token refreshed successfully", account, newToken);

            logger.info("✅ Token refreshed for user: {}", username);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.error("❌ Token refresh error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Gagal refresh token: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Token refresh error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Gagal refresh token"));
        }
    }

    // ==================== GET CURRENT USER ====================

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        logger.debug("Get current user attempt");

        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Token tidak ditemukan"));
            }

            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);

            if (!jwtUtil.validateToken(token, username)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Token tidak valid"));
            }

            Account account = accountRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("Account not found"));

            AuthResponse response = createAuthResponseWithToken("Current user retrieved", account, token);

            logger.debug("✅ Current user retrieved: {}", username);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.error("❌ Get current user error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("User tidak terautentikasi: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Get current user error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("User tidak terautentikasi"));
        }
    }

    // ==================== REGISTER USER ====================

    @PostMapping("/register/user")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        logger.info("User registration attempt for username: {}", request.getUsername());

        try {
            User newUser = registrationService.registerUser(
                    request.getUsername(),
                    request.getEmail(),
                    request.getPassword()
            );

            logger.info("✅ User registered successfully: {}", newUser.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    new AuthResponse(
                            "User registered successfully",
                            newUser.getAccountId(),
                            newUser.getUsername(),
                            newUser.getEmail(),
                            "USER"
                    )
            );
        } catch (IllegalArgumentException e) {
            logger.error("❌ User registration failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ User registration error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Registration failed: " + e.getMessage()));
        }
    }

    // ==================== REGISTER ADMIN ====================

    @PostMapping("/register/admin")
    public ResponseEntity<?> registerAdmin(@RequestBody RegisterAdminRequest request) {
        logger.info("Admin registration attempt for username: {}", request.getUsername());

        try {
            Admin newAdmin = registrationService.registerAdmin(
                    request.getUsername(),
                    request.getEmail(),
                    request.getPassword(),
                    request.getRequestedByAdminId()
            );

            logger.info("✅ Admin registered successfully: {}", newAdmin.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    new AuthResponse(
                            "Admin registered successfully",
                            newAdmin.getAccountId(),
                            newAdmin.getUsername(),
                            newAdmin.getEmail(),
                            "ADMIN"
                    )
            );
        } catch (SecurityException e) {
            logger.error("❌ Admin registration forbidden: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            logger.error("❌ Admin registration failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Admin registration error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Registration failed: " + e.getMessage()));
        }
    }

    // ==================== CHECK ACCOUNT EXISTS ====================

    @GetMapping("/check/{usernameOrEmail}")
    public ResponseEntity<?> checkAccountExists(@PathVariable String usernameOrEmail) {
        logger.debug("Checking if account exists: {}", usernameOrEmail);
        boolean exists = authenticationService.isAccountExists(usernameOrEmail);
        return ResponseEntity.ok(new CheckResponse(exists));
    }

    // ==================== UPDATE PROFILE (Settings) ====================

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request) {
        logger.info("Profile update attempt for username: {}", request.getUsername());

        try {
            Account account = accountRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new IllegalArgumentException("Account not found"));

            Account updated = authenticationService.updateProfile(
                    account.getAccountId(),
                    request.getUsername(),
                    request.getEmail()
                    // bio dihapus karena Artist bukan Account lagi
            );

            AuthResponse response = createAuthResponse("Profile updated successfully", updated);
            logger.info("✅ Profile updated successfully for user: {}", updated.getUsername());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.error("❌ Profile update failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Profile update error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to update profile: " + e.getMessage()));
        }
    }

    // ==================== CHANGE PASSWORD (Settings) ====================

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        logger.info("Password change attempt for username: {}", request.getUsername());

        try {
            Account account = accountRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new IllegalArgumentException("Account not found"));

            authenticationService.changePassword(
                    account.getAccountId(),
                    request.getCurrentPassword(),
                    request.getNewPassword()
            );

            logger.info("✅ Password changed successfully for user: {}", account.getUsername());
            return ResponseEntity.ok(new AuthMessageResponse("Password changed successfully"));
        } catch (IllegalArgumentException e) {
            logger.error("❌ Password change failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Password change error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to change password: " + e.getMessage()));
        }
    }

    // ==================== DELETE ACCOUNT (Settings) ====================

    @DeleteMapping("/account/{username}")
    public ResponseEntity<?> deleteAccount(@PathVariable String username) {
        logger.info("Account deletion attempt for username: {}", username);

        try {
            Account account = accountRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("Account not found"));

            authenticationService.deleteCurrentAccount(account.getAccountId());
            logger.info("✅ Account deleted successfully for user: {}", username);
            return ResponseEntity.ok(new AuthMessageResponse("Account deleted successfully"));
        } catch (IllegalArgumentException e) {
            logger.error("❌ Account deletion failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Account deletion error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to delete account: " + e.getMessage()));
        }
    }

    // ==================== Inner Classes ====================

    static class CheckResponse {
        private final boolean exists;
        public CheckResponse(boolean exists) { this.exists = exists; }
        public boolean isExists() { return exists; }
    }

    static class AuthMessageResponse {
        private final String message;
        public AuthMessageResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
    }
}
