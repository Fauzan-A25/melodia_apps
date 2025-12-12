package melodia.model.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import melodia.model.entity.Playlist;
import melodia.model.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    // ==================== Basic Queries ====================

    /**
     * Cari user berdasarkan username
     */
    Optional<User> findByUsername(String username);

    /**
     * Cari user berdasarkan email
     */
    Optional<User> findByEmail(String email);

    // ==================== Existence Checks ====================

    /**
     * Cek apakah username sudah dipakai
     */
    boolean existsByUsername(String username);

    /**
     * Cek apakah email sudah dipakai
     */
    boolean existsByEmail(String email);

    // ==================== Search Queries ====================

    /**
     * Cari semua user dengan substring pada username (search feature)
     */
    List<User> findByUsernameContainingIgnoreCase(String keyword);

    /**
     * Cari semua user dengan substring pada email
     */
    List<User> findByEmailContainingIgnoreCase(String keyword);

    // ==================== Playlist Queries ====================

    /**
     * Cari semua user yang punya playlist tertentu
     */
    List<User> findByPlaylistsContaining(Playlist playlist);

    // ❌ HAPUS - User tidak punya field library dan history lagi
    // Optional<User> findByLibrary(Library library);
    // Optional<User> findByHistory(History history);

    // ✅ Jika perlu cari user by library/history, gunakan userId langsung:
    // - User user = userRepository.findById(library.getUserId()).orElse(null);
    // - User user = userRepository.findById(history.getUserId()).orElse(null);
}
