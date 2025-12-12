package melodia.model.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Playlist - Koleksi lagu yang dibuat oleh User (atau Artist yang extends User)
 * Implements Playable dan Searchable
 */
@Entity
@Table(name = "playlists")
public class Playlist {

    @Id
    @Column(name = "playlist_id", length = 50, nullable = false)
    private String playlistId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    // ✅ Owner adalah User (bisa regular User atau Artist yang extends User)
    // Add @JsonIgnoreProperties untuk prevent circular reference
    @ManyToOne(fetch = FetchType.EAGER)  // Changed to EAGER untuk bisa akses owner info
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"playlists", "password", "hibernateLazyInitializer", "handler"})
    private User owner;

    // ✅ Daftar lagu dalam playlist (composition via junction table)
    // Add @JsonIgnore untuk prevent circular reference
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "playlist_songs",
        joinColumns = @JoinColumn(name = "playlist_id"),
        inverseJoinColumns = @JoinColumn(name = "song_id")
    )
    @JsonIgnore  // Jangan serialize songs, handle manual via getSongCount()
    private List<Song> songs = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public Playlist(String name, User owner) {
        this.name = name;
        this.owner = owner;
        this.createdAt = LocalDateTime.now();
    }

    protected Playlist() {
        this.createdAt = LocalDateTime.now();
    }

    // ==================== Getters & Setters ====================
    public String getPlaylistId() { return playlistId; }
    public void setPlaylistId(String playlistId) { this.playlistId = playlistId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    /**
     * Get semua lagu dalam playlist (implements Playable interface)
     */
    public List<Song> getSongs() { return songs; }
    
    public void setSongs(List<Song> songs) { 
        this.songs = songs != null ? songs : new ArrayList<>(); 
    }

    // ==================== Helper Methods ====================
    
    /**
     * Tambah lagu ke playlist
     */
    public void addSong(Song song) {
        if (song != null && !this.songs.contains(song)) {
            this.songs.add(song);
        }
    }

    /**
     * Hapus lagu dari playlist
     */
    public void removeSong(Song song) {
        if (song != null) {
            this.songs.remove(song);
        }
    }

    /**
     * Cek apakah lagu ada di playlist
     */
    public boolean containsSong(Song song) {
        return this.songs.contains(song);
    }

    /**
     * Get jumlah lagu dalam playlist
     * ✅ Method ini akan di-serialize ke JSON sebagai "songCount"
     */
    public int getSongCount() {
        return this.songs.size();
    }

    /**
     * Cek apakah user tertentu adalah owner playlist ini
     */
    public boolean isOwnedBy(User user) {
        return this.owner != null && this.owner.equals(user);
    }

    /**
     * Search playlist by keyword (implements Searchable interface)
     * Cari di nama dan deskripsi playlist
     */
    public boolean search(String keyword) {
        if (keyword == null || keyword.isEmpty()) {
            return false;
        }
        String lowerKeyword = keyword.toLowerCase();
        return (this.name != null && this.name.toLowerCase().contains(lowerKeyword)) ||
               (this.description != null && this.description.toLowerCase().contains(lowerKeyword));
    }
}
