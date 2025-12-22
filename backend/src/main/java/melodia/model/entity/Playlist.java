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
 * Playlist - Koleksi lagu yang dibuat oleh user di Melodia.
 * Bisa dimiliki oleh User biasa maupun Artist (karena Artist extends User di domain ini).
 */
@Entity
@Table(name = "playlists")
public class Playlist {

    // ==================== Identitas & metadata ====================

    @Id
    @Column(name = "playlist_id", length = 50, nullable = false)
    private String playlistId; //! ID unik playlist, di-set dari service (bisa prefix + timestamp seperti entity lain).

    @Column(name = "name", nullable = false, length = 100)
    private String name; // * Nama playlist yang muncul di UI.

    @Column(name = "description", length = 500)
    private String description; // * Deskripsi singkat playlist (opsional).

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // * Waktu playlist dibuat, berguna untuk sort dan riwayat.

    // ==================== Owner playlist ====================

    //! Owner adalah User (bisa regular user atau artist).
    //  Menggunakan EAGER agar informasi owner tersedia saat playlist di-fetch untuk UI.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({
            "playlists",
            "password",
            "hibernateLazyInitializer",
            "handler"
    }) // * Hindari circular reference & data sensitif saat serialize User.
    private User owner;

    // ==================== Relasi dengan lagu ====================

    // * Daftar lagu yang menjadi isi playlist.
    // * Relasi many-to-many melalui tabel junction "playlist_songs".
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "playlist_songs",
        joinColumns = @JoinColumn(name = "playlist_id"),
        inverseJoinColumns = @JoinColumn(name = "song_id")
    )
    @JsonIgnore // * Hindari serialisasi langsung entity song untuk mencegah lazy-loading issue / siklus.
    private List<Song> songs = new ArrayList<>();

    // ==================== Constructors ====================

    // * Dipakai saat membuat playlist baru dari kode (misalnya dari UI).
    public Playlist(String name, User owner) {
        this.name = name;
        this.owner = owner;
        this.createdAt = LocalDateTime.now();
    }

    // * Diperlukan oleh JPA.
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
     * Mengembalikan semua lagu dalam playlist.
     * Biasanya dipakai di layer service, bukan langsung di JSON response.
     */
    public List<Song> getSongs() { return songs; }

    public void setSongs(List<Song> songs) {
        // * Jaga supaya list tidak pernah null.
        this.songs = songs != null ? songs : new ArrayList<>();
    }

    // ==================== Helper Methods ====================

    /**
     * Menambahkan lagu ke playlist jika belum ada.
     */
    public void addSong(Song song) {
        if (song != null && !this.songs.contains(song)) {
            this.songs.add(song);
        }
    }

    /**
     * Menghapus lagu dari playlist.
     */
    public void removeSong(Song song) {
        if (song != null) {
            this.songs.remove(song);
        }
    }

    /**
     * Mengecek apakah lagu tertentu ada di playlist.
     */
    public boolean containsSong(Song song) {
        return song != null && this.songs.contains(song);
    }

    /**
     * Mengembalikan jumlah lagu dalam playlist.
     * Biasanya di-expose ke JSON sebagai "songCount" untuk ringkasan playlist.
     */
    public int getSongCount() {
        return this.songs.size();
    }

    /**
     * Mengecek apakah user tertentu adalah pemilik playlist ini.
     */
    public boolean isOwnedBy(User user) {
        return this.owner != null && this.owner.equals(user);
    }

    /**
     * Pencarian sederhana berdasarkan nama dan deskripsi playlist.
     * Bisa dipakai untuk filter di sisi backend sebelum kirim ke frontend.
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
