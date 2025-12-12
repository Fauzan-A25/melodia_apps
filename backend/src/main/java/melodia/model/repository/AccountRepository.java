package melodia.model.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;  // ✅ TAMBAHKAN

import melodia.model.entity.Account;  // ✅ TAMBAHKAN

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {

    // Cari akun berdasarkan username (unique)
    Optional<Account> findByUsername(String username);

    // Cari akun berdasarkan email (unique)
    Optional<Account> findByEmail(String email);

    // Cek apakah username sudah ada
    boolean existsByUsername(String username);

    // Cek apakah email sudah ada
    boolean existsByEmail(String email);

    @Query("SELECT a FROM Account a WHERE TYPE(a) = :type")
    List<Account> findByAccountType(@Param("type") Class<?> type);
}
