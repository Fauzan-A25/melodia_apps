package melodia.model.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import melodia.model.entity.Account;

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
}
