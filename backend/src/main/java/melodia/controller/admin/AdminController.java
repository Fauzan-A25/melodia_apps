package melodia.controller.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import melodia.model.dto.common.ApiResponse;
import melodia.model.dto.response.admin.AdminStatsResponse;
import melodia.model.service.admin.AdminService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // ==================== DASHBOARD STATS ====================
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getAdminStats() {
        AdminStatsResponse stats = adminService.getAdminStats();
        return ResponseEntity.ok(ApiResponse.success("Admin statistics retrieved successfully", stats));
    }
}
