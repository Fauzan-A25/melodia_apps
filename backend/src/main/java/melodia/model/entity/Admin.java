package melodia.model.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityManager;

/**
 * Admin: Simple entity for platform controller
 * Extend Account, tanpa fitur konsumsi musik
 */
@Entity
@DiscriminatorValue("ADMIN")
public class Admin extends Account {

    // ✅ TAMBAHKAN Default Constructor (required by JPA)
    public Admin() {
        super();
    }

    // Constructor dengan parameter
    public Admin(String username, String email, String password) {
        super(username, email, password);
    }

    // Method: menghapus akun
    public boolean deleteAccount(Account account, EntityManager em) {
        if (account != null && em.contains(account)) {
            em.remove(account);
            return true;
        }
        return false;
    }

    // Method: menghapus konten lagu
    public boolean deleteSong(Song song, EntityManager em) {
        if (song != null && em.contains(song)) {
            em.remove(song);
            return true;
        }
        return false;
    }

    // Method: menghapus playlist atau album
    public boolean deletePlaylist(Playlist playlist, EntityManager em) {
        if (playlist != null && em.contains(playlist)) {
            em.remove(playlist);
            return true;
        }
        return false;
    }

    public boolean deleteAlbum(Album album, EntityManager em) {
        if (album != null && em.contains(album)) {
            em.remove(album);
            return true;
        }
        return false;
    }

    // Tampilkan dashboard admin
    @Override
    public void displayDashboard() {
        System.out.println("=== Admin Dashboard ===");
        System.out.println("Total kontrol user dan konten tersedia.");
    }

    @Override
    public String getAccountType() {
        return "ADMIN";
    }
}