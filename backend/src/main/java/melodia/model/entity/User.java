package melodia.model.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;

/**
 * User - Akun yang memakai Melodia untuk mendengarkan musik dan membuat playlist.
 * Disimpan di tabel "accounts" sebagai subtype dari Account dengan account_type = "USER".
 */
@Entity
@DiscriminatorValue("USER") // * Row di tabel accounts dengan account_type = "USER" akan di-map ke entity ini.
public class User extends Account {

    // ==================== Relasi dengan Playlist ====================

    //! Satu user bisa memiliki banyak playlist.
    //  orphanRemoval = true → jika playlist dihapus dari list dan tidak direferensi di tempat lain,
    //  JPA akan menghapus row-nya dari tabel "playlists". [web:145][web:147]
    @OneToMany(mappedBy = "owner",
               cascade = CascadeType.ALL,
               fetch = FetchType.LAZY,
               orphanRemoval = true)
    private List<Playlist> playlists = new ArrayList<>();

    // ==================== Constructors ====================

    // * Dipakai saat registrasi user baru.
    public User(String username, String email, String password) {
        super(username, email, password);
    }

    // * Diperlukan oleh JPA.
    protected User() {
        super();
    }

    // ==================== Business Methods ====================

    /**
     * Membuat playlist baru yang dimiliki user ini dan langsung menambahkannya ke koleksi playlists.
     */
    public Playlist createPlaylist(String name) {
        Playlist playlist = new Playlist(name, this);
        playlists.add(playlist);
        return playlist;
    }

    // ==================== Getters & Setters ====================

    public List<Playlist> getPlaylists() {
        return playlists;
    }

    public void setPlaylists(List<Playlist> playlists) {
        // * Jaga supaya list tidak pernah null.
        this.playlists = playlists != null ? playlists : new ArrayList<>();
    }

    // ==================== Override Methods ====================

    @Override
    public String getAccountType() {
        // * Harus konsisten dengan @DiscriminatorValue("USER").
        return "USER";
    }

    @Override
    public String toString() {
        // * Representasi ringkas untuk logging/debug.
        return "User{" +
                "accountId='" + getAccountId() + '\'' +
                ", username='" + getUsername() + '\'' +
                ", email='" + getEmail() + '\'' +
                ", playlistsCount=" + playlists.size() +
                '}';
    }
}
