package melodia.model.entity;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;

/**
 * Artist - Extends User (multilevel inheritance)
 * Bisa konsumsi musik (via fitur User) & upload music sebagai content creator
 */
@Entity
@DiscriminatorValue("ARTIST")
public class Artist extends User {

    @Column(name = "bio", length = 1000)
    private String bio;

    // Lagu yang di-upload oleh artist ini (bidirectional, one-to-many)
    @OneToMany(mappedBy = "artist", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonIgnore // ⬅ jangan kirim uploadedSongs ke JSON untuk hindari loop
    private List<Song> uploadedSongs = new ArrayList<>();

    // ==================== Constructors ====================

    /**
     * Constructor untuk registrasi artist baru
     */
    public Artist(String username, String email, String password, String bio) {
        super(username, email, password);
        this.bio = bio;
    }

    /**
     * Default constructor (required by JPA/Hibernate)
     */
    protected Artist() {
        super();
    }

    // ==================== Business Methods ====================

    /**
     * Upload song baru oleh artist ini
     */
    public void uploadSong(Song song) {
        if (song != null && !uploadedSongs.contains(song)) {
            uploadedSongs.add(song);
            song.setArtist(this);  // Sync bidirectional relationship
        }
    }

    /**
     * Delete song by songId
     */
    public void deleteSong(String songId) {
        uploadedSongs.removeIf(song -> song != null && song.getSongId().equals(songId));
    }

    /**
     * Get total uploaded songs count
     */
    public int getUploadedSongsCount() {
        return this.uploadedSongs.size();
    }

    // ==================== Getters & Setters ====================

    public List<Song> getUploadedSongs() {
        return this.uploadedSongs;
    }

    public void setUploadedSongs(List<Song> uploadedSongs) {
        this.uploadedSongs = uploadedSongs != null ? uploadedSongs : new ArrayList<>();
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    // ==================== Override Methods ====================

    @Override
    public void displayDashboard() {
        System.out.println("=== Artist Dashboard ===");
        System.out.println("Username: " + getUsername());
        System.out.println("Email: " + getEmail());
        System.out.println("Account ID: " + getAccountId());
        System.out.println("Bio: " + (bio != null ? bio : "-"));
        System.out.println("Total Uploaded Songs: " + uploadedSongs.size());
        System.out.println("Playlists: " + getPlaylists().size());
    }

    @Override
    public String getAccountType() {
        return "ARTIST";
    }

    @Override
    public String toString() {
        return "Artist{" +
                "accountId='" + getAccountId() + '\'' +
                ", username='" + getUsername() + '\'' +
                ", email='" + getEmail() + '\'' +
                ", bio='" + (bio != null ? bio.substring(0, Math.min(bio.length(), 50)) : "none") + "...'" +
                ", uploadedSongs=" + uploadedSongs.size() +
                ", playlists=" + getPlaylists().size() +
                '}';
    }
}
