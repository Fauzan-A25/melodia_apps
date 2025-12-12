package melodia.controller.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import melodia.model.dto.request.admin.BanUserRequest;
import melodia.model.dto.response.ErrorResponse;
import melodia.model.dto.response.UserManagementResponse;
import melodia.view.service.admin.UserManagementService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserManagementController {

    @Autowired
    private UserManagementService userManagementService;

    // ==================== GET ALL USERS ====================
    @GetMapping
    public ResponseEntity<?> getAllUsers(@RequestParam(required = false) String type) {
        try {
            List<UserManagementResponse> users;
            
            if (type != null && !type.isEmpty()) {
                users = userManagementService.getUsersByType(type);
            } else {
                users = userManagementService.getAllUsers();
            }
            
            return ResponseEntity.ok(users);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to fetch users: " + e.getMessage()));
        }
    }

    // ==================== GET BANNED USERS ====================
    @GetMapping("/banned")
    public ResponseEntity<?> getBannedUsers() {
        try {
            List<UserManagementResponse> bannedUsers = userManagementService.getBannedUsers();
            return ResponseEntity.ok(bannedUsers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to fetch banned users: " + e.getMessage()));
        }
    }

    // ==================== SEARCH USERS ====================
    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam String q) {
        try {
            if (q == null || q.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Search query cannot be empty"));
            }
            
            List<UserManagementResponse> users = userManagementService.searchUsers(q);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to search users: " + e.getMessage()));
        }
    }

    // ==================== BAN USER ====================
    @PostMapping("/{accountId}/ban")
    public ResponseEntity<?> banUser(
            @PathVariable String accountId,
            @RequestBody BanUserRequest request) {
        try {
            if (request.getReason() == null || request.getReason().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Ban reason is required"));
            }
            
            userManagementService.banUser(accountId, request.getReason());
            return ResponseEntity.ok(new SuccessResponse("User banned successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to ban user: " + e.getMessage()));
        }
    }

    // ==================== UNBAN USER ====================
    @PostMapping("/{accountId}/unban")
    public ResponseEntity<?> unbanUser(@PathVariable String accountId) {
        try {
            userManagementService.unbanUser(accountId);
            return ResponseEntity.ok(new SuccessResponse("User unbanned successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to unban user: " + e.getMessage()));
        }
    }

    // ==================== DELETE USER ====================
    @DeleteMapping("/{accountId}")
    public ResponseEntity<?> deleteUser(@PathVariable String accountId) {
        try {
            userManagementService.deleteUser(accountId);
            return ResponseEntity.ok(new SuccessResponse("User deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to delete user: " + e.getMessage()));
        }
    }

    // ==================== Inner Class: Success Response ====================
    static class SuccessResponse {
        private final String message;

        public SuccessResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }
    }
}
