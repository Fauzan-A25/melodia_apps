package melodia.controller.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import melodia.model.dto.response.AdminStatsResponse;
import melodia.model.dto.response.ErrorResponse;
import melodia.model.service.admin.AdminService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // ==================== DASHBOARD STATS ====================
    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats() {
        try {
            AdminStatsResponse stats = adminService.getAdminStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to fetch admin stats: " + e.getMessage()));
        }
    }
}
