package melodia.model.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;

@Entity
@DiscriminatorValue("USER")
public class User extends Account {

    // ✅ Playlist tetap ada (tidak berubah)
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<Playlist> playlists = new ArrayList<>();

    // ==================== Constructors ====================
    
    public User(String username, String email, String password) {
        super(username, email, password);
    }

    protected User() {
        super();
    }

    // ==================== Business Methods ====================
    
    public Playlist createPlaylist(String name) {
        Playlist playlist = new Playlist(name, this);
        playlists.add(playlist);
        return playlist;
    }

    public List<Playlist> getPlaylists() {
        return playlists;
    }

    public void setPlaylists(List<Playlist> playlists) {
        this.playlists = playlists != null ? playlists : new ArrayList<>();
    }

    // ==================== Override Methods ====================
    
    @Override
    public void displayDashboard() {
        System.out.println("=== User Dashboard ===");
        System.out.println("Username: " + getUsername());
        System.out.println("Email: " + getEmail());
        System.out.println("Account ID: " + getAccountId());
        System.out.println("Playlists: " + playlists.size());
    }

    @Override
    public String getAccountType() {
        return "USER";
    }

    @Override
    public String toString() {
        return "User{" +
                "accountId='" + getAccountId() + '\'' +
                ", username='" + getUsername() + '\'' +
                ", email='" + getEmail() + '\'' +
                ", playlistsCount=" + playlists.size() +
                '}';
    }
}
