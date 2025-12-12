package melodia.model.repository;

import melodia.model.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, String> {
    
    // Cari admin berdasarkan username
    Optional<Admin> findByUsername(String username);

    // Cari admin berdasarkan email
    Optional<Admin> findByEmail(String email);

    // Mengecek apakah username sudah dipakai
    boolean existsByUsername(String username);

    // Mengecek apakah email sudah dipakai
    boolean existsByEmail(String email);
}
