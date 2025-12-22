package melodia.controller.auth;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
import melodia.model.dto.common.ApiResponse;
import melodia.model.dto.request.auth.ChangePasswordRequest;
import melodia.model.dto.request.auth.LoginRequest;
import melodia.model.dto.request.auth.RegisterAdminRequest;
import melodia.model.dto.request.auth.RegisterRequest;
import melodia.model.dto.request.auth.UpdateProfileRequest;
import melodia.model.dto.response.auth.AuthResponse;
import melodia.model.entity.Account;
import melodia.model.entity.Admin;
import melodia.model.entity.User;
import melodia.model.repository.AccountRepository;
import melodia.model.service.auth.AuthenticationService;
import melodia.model.service.auth.RegistrationService;
import melodia.security.JwtUtil;

@RestController
@RequestMapping("/api/auth")
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

    // ==================== LOGIN ====================

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        logger.info("Login attempt for username: {}", request.getUsername());
        
        Account account = authenticationService.login(request.getUsername(), request.getPassword());
        String token = jwtUtil.generateToken(account.getUsername());
        AuthResponse response = createAuthResponseWithToken("Login successful", account, token);
        
        logger.info("✅ Login successful for user: {}", account.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    // ==================== LOGOUT ====================

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<?>> logout(@RequestHeader(value = "Authorization", required = false) String token) {
        logger.info("Logout successful");
        return ResponseEntity.ok(ApiResponse.success("Logout berhasil. Token akan expired otomatis."));
    }

    // ==================== VALIDATE TOKEN ====================

    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<AuthResponse>> validateToken(@RequestHeader("Authorization") String authHeader) {
        logger.debug("Token validation attempt");
        
        String token = extractToken(authHeader);
        String username = jwtUtil.extractUsername(token);
        
        if (!jwtUtil.validateToken(token, username)) {
            throw new melodia.controller.exception.auth.UnauthorizedException();
        }

        Account account = accountRepository.findByUsername(username)
            .orElseThrow(() -> new melodia.controller.exception.auth.InvalidCredentialsException());

        AuthResponse response = createAuthResponseWithToken("Token valid", account, token);
        logger.debug("✅ Token valid for user: {}", username);
        return ResponseEntity.ok(ApiResponse.success("Token is valid", response));
    }

    // ==================== REFRESH TOKEN ====================

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestHeader("Authorization") String authHeader) {
        logger.info("Token refresh attempt");
        
        String oldToken = extractToken(authHeader);
        String username = jwtUtil.extractUsername(oldToken);
        Account account = accountRepository.findByUsername(username)
            .orElseThrow(() -> new melodia.controller.exception.auth.InvalidCredentialsException());

        String newToken = jwtUtil.generateToken(username);
        AuthResponse response = createAuthResponseWithToken("Token refreshed successfully", account, newToken);
        
        logger.info("✅ Token refreshed for user: {}", username);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    // ==================== GET CURRENT USER ====================

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        logger.debug("Get current user attempt");
        
        String token = extractToken(authHeader);
        String username = jwtUtil.extractUsername(token);

        if (!jwtUtil.validateToken(token, username)) {
            throw new melodia.controller.exception.auth.UnauthorizedException();
        }

        Account account = accountRepository.findByUsername(username)
            .orElseThrow(() -> new melodia.controller.exception.auth.InvalidCredentialsException());

        AuthResponse response = createAuthResponseWithToken("Current user retrieved", account, token);
        logger.debug("✅ Current user retrieved: {}", username);
        return ResponseEntity.ok(ApiResponse.success("Current user retrieved successfully", response));
    }

    // ==================== REGISTER USER ====================

    @PostMapping("/register/user")
    public ResponseEntity<ApiResponse<AuthResponse>> registerUser(@Valid @RequestBody RegisterRequest request) {
        logger.info("User registration attempt for username: {}", request.getUsername());

        User newUser = registrationService.registerUser(
            request.getUsername(),
            request.getEmail(),
            request.getPassword()
        );

        AuthResponse response = new AuthResponse();
        response.setAccountId(newUser.getAccountId());
        response.setUsername(newUser.getUsername());
        response.setEmail(newUser.getEmail());
        response.setAccountType("USER");

        logger.info("✅ User registered successfully: {}", newUser.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse.success("User registered successfully", response)
        );
    }

    // ==================== REGISTER ADMIN ====================

    @PostMapping("/register/admin")
    public ResponseEntity<ApiResponse<AuthResponse>> registerAdmin(@Valid @RequestBody RegisterAdminRequest request) {
        logger.info("Admin registration attempt for username: {}", request.getUsername());

        Admin newAdmin = registrationService.registerAdmin(
            request.getUsername(),
            request.getEmail(),
            request.getPassword(),
            request.getRequestedByAdminId()
        );

        AuthResponse response = new AuthResponse();
        response.setAccountId(newAdmin.getAccountId());
        response.setUsername(newAdmin.getUsername());
        response.setEmail(newAdmin.getEmail());
        response.setAccountType("ADMIN");

        logger.info("✅ Admin registered successfully: {}", newAdmin.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse.success("Admin registered successfully", response)
        );
    }

    // ==================== CHECK ACCOUNT EXISTS ====================

    @GetMapping("/check/{usernameOrEmail}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkAccountExists(@PathVariable String usernameOrEmail) {
        logger.debug("Checking if account exists: {}", usernameOrEmail);
        boolean exists = authenticationService.isAccountExists(usernameOrEmail);
        return ResponseEntity.ok(ApiResponse.success("Account existence checked", Map.of("exists", exists)));
    }

    // ==================== UPDATE PROFILE ====================

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<AuthResponse>> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        logger.info("Profile update attempt for username: {}", request.getUsername());

        Account account = accountRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new melodia.controller.exception.user.UserNotFoundException(request.getUsername()));

        Account updated = authenticationService.updateProfile(
            account.getAccountId(),
            request.getUsername(),
            request.getEmail()
        );

        AuthResponse response = createAuthResponse("Profile updated successfully", updated);
        logger.info("✅ Profile updated successfully for user: {}", updated.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    // ==================== CHANGE PASSWORD ====================

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<?>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        logger.info("Password change attempt for username: {}", request.getUsername());

        Account account = accountRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new melodia.controller.exception.user.UserNotFoundException(request.getUsername()));

        authenticationService.changePassword(
            account.getAccountId(),
            request.getCurrentPassword(),
            request.getNewPassword()
        );

        logger.info("✅ Password changed successfully for user: {}", account.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    // ==================== DELETE ACCOUNT ====================

    @DeleteMapping("/account/{username}")
    public ResponseEntity<ApiResponse<?>> deleteAccount(@PathVariable String username) {
        logger.info("Account deletion attempt for username: {}", username);

        Account account = accountRepository.findByUsername(username)
            .orElseThrow(() -> new melodia.controller.exception.user.UserNotFoundException(username));

        authenticationService.deleteCurrentAccount(account.getAccountId());
        logger.info("✅ Account deleted successfully for user: {}", username);
        return ResponseEntity.ok(ApiResponse.success("Account deleted successfully"));
    }

    // ==================== Helper Methods ====================

    private String extractToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new melodia.controller.exception.auth.UnauthorizedException();
        }
        return authHeader.substring(7);
    }

    private AuthResponse createAuthResponse(String message, Account account) {
        AuthResponse response = new AuthResponse();
        response.setAccountId(account.getAccountId());
        response.setUsername(account.getUsername());
        response.setEmail(account.getEmail());
        response.setAccountType(account.getAccountType());
        return response;
    }

    private AuthResponse createAuthResponseWithToken(String message, Account account, String token) {
        AuthResponse response = createAuthResponse(message, account);
        response.setToken(token);
        response.setExpiresIn(jwtUtil.getExpirationTimeInSeconds());
        return response;
    }
}
