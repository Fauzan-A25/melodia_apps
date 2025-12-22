package melodia.model.service.admin;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import melodia.controller.exception.admin.InvalidOperationException;
import melodia.model.dto.response.admin.AdminStatsResponse;
import melodia.model.entity.Admin;
import melodia.model.entity.Album;
import melodia.model.entity.Artist;
import melodia.model.entity.Playlist;
import melodia.model.entity.Song;
import melodia.model.entity.User;
import melodia.model.repository.AdminRepository;
import melodia.model.repository.AlbumRepository;
import melodia.model.repository.ArtistRepository;
import melodia.model.repository.GenreRepository;
import melodia.model.repository.PlaylistRepository;
import melodia.model.repository.SongRepository;
import melodia.model.repository.UserRepository;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ArtistRepository artistRepository;

    @Autowired
    private SongRepository songRepository;

    @Autowired
    private AlbumRepository albumRepository;

    @Autowired
    private PlaylistRepository playlistRepository;

    @Autowired
    private GenreRepository genreRepository;

    // ==================== Dashboard Statistics ====================
    
    /**
     * Get admin dashboard statistics
     * @return AdminStatsResponse with platform statistics
     */
    public AdminStatsResponse getAdminStats() {
        int totalUsers = (int) userRepository.count();
        int totalArtists = (int) artistRepository.count();
        int totalGenres = (int) genreRepository.count();
        
        // Count banned accounts (assuming you have isBanned field)
        // If not, you can use: int bannedAccounts = 0;
        int bannedAccounts = countBannedAccounts();
        
        return new AdminStatsResponse(totalUsers, totalArtists, totalGenres, bannedAccounts);
    }

    /**
     * Count total banned accounts (User + Artist)
     * @return count of banned accounts
     */
    private int countBannedAccounts() {
        // TODO: Implement based on your Account entity
        // If you have isBanned field in Account/User/Artist:
        // return userRepository.countByIsBannedTrue() + artistRepository.countByIsBannedTrue();
        
        // For now, return 0 if ban system not implemented yet
        return 0;
    }

    // ==================== Admin Management ====================
    
    /**
     * Get all admins
     */
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    /**
     * Get admin by ID
     */
    public Admin getAdminById(String adminId) {
        return adminRepository.findById(adminId)
            .orElseThrow(() -> new InvalidOperationException("Admin tidak ditemukan"));
    }

    /**
     * Update admin profile
     */
    public Admin updateAdminProfile(String adminId, String newUsername, String newEmail) {
        Admin admin = getAdminById(adminId);
        
        if (newUsername != null && !newUsername.trim().isEmpty()) {
            admin.setUsername(newUsername);
        }
        if (newEmail != null && !newEmail.trim().isEmpty()) {
            admin.setEmail(newEmail);
        }
        
        return adminRepository.save(admin);
    }

    /**
     * Delete admin (only super admin can do this)
     */
    public void deleteAdmin(String adminId) {
        if (!adminRepository.existsById(adminId)) {
            throw new InvalidOperationException("Admin tidak ditemukan");
        }
        adminRepository.deleteById(adminId);
    }

    // ==================== Content Management ====================
    
    /**
     * Delete song by admin (admin override)
     */
    public void deleteSongByAdmin(String songId) {
        Song song = songRepository.findById(songId)
            .orElseThrow(() -> new InvalidOperationException("Song tidak ditemukan"));
        songRepository.delete(song);
    }

    /**
     * Delete album by admin (admin override)
     */
    public void deleteAlbumByAdmin(String albumId) {
        Album album = albumRepository.findById(albumId)
            .orElseThrow(() -> new InvalidOperationException("Album tidak ditemukan"));
        albumRepository.delete(album);
    }

    /**
     * Delete playlist by admin (admin override)
     */
    public void deletePlaylistByAdmin(String playlistId) {
        Playlist playlist = playlistRepository.findById(playlistId)
            .orElseThrow(() -> new InvalidOperationException("Playlist tidak ditemukan"));
        playlistRepository.delete(playlist);
    }

    // ==================== User/Artist Control ====================
    
    /**
     * Delete user by admin
     */
    public void deleteUserByAdmin(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new InvalidOperationException("User tidak ditemukan");
        }
        userRepository.deleteById(userId);
    }

    /**
     * Delete artist by admin
     */
    public void deleteArtistByAdmin(String artistId) {
        if (!artistRepository.existsById(artistId)) {
            throw new InvalidOperationException("Artist tidak ditemukan");
        }
        artistRepository.deleteById(artistId);
    }

    // ==================== Search & Filter for Admin ====================
    
    /**
     * Search users for admin panel
     */
    public List<User> searchUsers(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return userRepository.findAll();
        }
        return userRepository.findByUsernameContainingIgnoreCase(keyword);
    }

    /**
     * Search artists for admin panel
     */
    public List<Artist> searchArtists(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return artistRepository.findAll();
        }
        return artistRepository.findByBioContainingIgnoreCase(keyword);
    }

    /**
     * Search songs for admin panel
     */
    public List<Song> searchSongs(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return songRepository.findAll();
        }
        return songRepository.findByTitleContainingIgnoreCase(keyword);
    }
}
