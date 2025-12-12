package melodia.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import melodia.model.entity.Admin;
import melodia.model.repository.AdminRepository;

@Configuration
public class AdminSeedConfig {

    @Bean
    @SuppressWarnings("unused") // ✅ Suppress warning untuk Bean method
    CommandLineRunner seedSuperAdmin(AdminRepository adminRepository) {
        return args -> {
            // Kalau belum ada admin sama sekali, buat satu
            if (adminRepository.count() == 0) {
                Admin superAdmin = new Admin(
                        "superadmin",
                        "superadmin@melodia.com",
                        "supersecret" // nanti di-hash oleh Account
                );
                superAdmin.setAccountId("ADM" + System.currentTimeMillis());
                adminRepository.save(superAdmin);
                
                System.out.println("✅ Super Admin created successfully");
            } else {
                System.out.println("ℹ️ Admin already exists, skipping seed");
            }
        };
    }
}
