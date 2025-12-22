package melodia.controller.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import melodia.model.dto.common.ApiResponse;
import melodia.model.dto.response.admin.UserManagementResponse;
import melodia.model.service.admin.UserManagementService;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class UserManagementController {

    @Autowired
    private UserManagementService userManagementService;

    // ==================== GET OPERATIONS ====================

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserManagementResponse>>> getAllUsers() {
        List<UserManagementResponse> users = userManagementService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", users));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserManagementResponse>> getUserById(@PathVariable String userId) {
        UserManagementResponse user = userManagementService.getUserDetailsById(userId);
        return ResponseEntity.ok(ApiResponse.success("User details fetched successfully", user));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserManagementResponse>>> searchUsers(@RequestParam String keyword) {
        List<UserManagementResponse> users = userManagementService.searchUsers(keyword);
        return ResponseEntity.ok(ApiResponse.success("Users searched successfully", users));
    }

    // ==================== DELETE OPERATIONS ====================

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<?>> deleteUser(@PathVariable String userId) {
        userManagementService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }

    @PutMapping("/{userId}/ban")
    public ResponseEntity<ApiResponse<?>> banUser(@PathVariable String userId, @RequestParam String reason) {
        userManagementService.banUser(userId, reason);
        return ResponseEntity.ok(ApiResponse.success("User banned successfully"));
    }

    @PutMapping("/{userId}/unban")
    public ResponseEntity<ApiResponse<?>> unbanUser(@PathVariable String userId) {
        userManagementService.unbanUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User unbanned successfully"));
    }

    // ==================== STATISTICS ====================

    @GetMapping("/{userId}/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserStats(@PathVariable String userId) {
        Map<String, Object> stats = userManagementService.getUserStats(userId);
        return ResponseEntity.ok(ApiResponse.success("User statistics retrieved successfully", stats));
    }

    @GetMapping("/stats/total")
    public ResponseEntity<ApiResponse<Long>> getTotalUsers() {
        long total = userManagementService.getTotalUsersCount();
        return ResponseEntity.ok(ApiResponse.success("Total users count retrieved", total));
    }
}
