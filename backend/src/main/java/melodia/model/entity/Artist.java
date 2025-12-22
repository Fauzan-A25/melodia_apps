package melodia.model.entity;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

/**
 * Entity yang merepresentasikan seorang artist di Melodia.
 * Artist menyimpan profil dasar dan daftar lagu yang dimiliki.
 */
@Entity
@Table(name = "artists")
public class Artist {

    // ==================== Identitas & profil ====================

    @Id
    @Column(name = "artist_id", length = 36, nullable = false, updatable = false)
    private String artistId; //! ID unik untuk artist, digenerate otomatis dengan prefix "ART" di onCreate().

    @Column(name = "artist_name", nullable = false, unique = true, length = 100)
    private String artistName; // * Nama panggung / nama artist yang tampil di UI.

    @Column(name = "bio", length = 1000)
    private String bio; // * Deskripsi singkat tentang artist (bisa ditampilkan di halaman profil).

    // ==================== Relasi dengan Song ====================

    // * Satu artist bisa punya banyak lagu.
    // * Cascade ALL → ketika artist dihapus, semua lagu yang di-mapped ke artist ini ikut ter-update/terhapus
    //   sesuai aturan relasi di entity Song dan di DB.
    @OneToMany(mappedBy = "artist", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore // * Hindari serialisasi langsung list lagu (bisa memicu lazy load & siklus JSON).
    private List<Song> songs = new ArrayList<>();

    // ==================== Constructors ====================

    // * Dipakai saat membuat artist baru (misalnya dari panel admin).
    public Artist(String artistName, String bio) {
        this.artistName = artistName;
        this.bio = bio;
    }

    // * Diperlukan oleh JPA untuk proses loading dari database.
    protected Artist() {
    }

    // ==================== Lifecycle Callback ====================

    // * Generate artistId otomatis sebelum pertama kali disimpan ke database.
    @PrePersist
    protected void onCreate() {
        if (this.artistId == null) {
            this.artistId = generateArtistId();
        }
    }

    // * Pola ID: "ART" + 11 digit terakhir currentTimeMillis + 1 digit random (0–9).
    //   Contoh: ART12345678901X → cukup unik dan tetap mudah dikenali sebagai ID artist.
    private String generateArtistId() {
        String prefix = "ART";
        String timePart = String.valueOf(System.currentTimeMillis());
        // Ambil 11 digit terakhir supaya panjang ID lebih pendek tapi tetap mengandung informasi waktu.
        timePart = timePart.substring(timePart.length() - 11);
        int random = (int) (Math.random() * 10); // 0–9
        return prefix + timePart + random;
    }

    // ==================== Business Methods ====================

    // * Menambahkan lagu ke daftar lagu artist dan menjaga konsistensi relasi dua arah.
    public void addSong(Song song) {
        if (song != null && !songs.contains(song)) {
            songs.add(song);
            song.setArtist(this);
        }
    }

    // * Menghapus lagu dari artist dan memutus relasi dua arah.
    public void removeSong(Song song) {
        if (song != null) {
            songs.remove(song);
            if (song.getArtist() == this) {
                song.setArtist(null);
            }
        }
    }

    // * Memudahkan akses total lagu yang dimiliki artist (berguna untuk UI/dashboard).
    public int getTotalSongs() {
        return songs.size();
    }

    // ==================== Getters & Setters ====================

    public String getArtistId() {
        return artistId;
    }

    public void setArtistId(String artistId) {
        this.artistId = artistId;
    }

    public String getArtistName() {
        return artistName;
    }

    public void setArtistName(String artistName) {
        this.artistName = artistName;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public List<Song> getSongs() {
        return songs;
    }

    public void setSongs(List<Song> songs) {
        // * Jaga supaya list tidak pernah null agar aman dipakai di service / template.
        this.songs = songs != null ? songs : new ArrayList<>();
    }

    // ==================== Override Methods ====================

    @Override
    public String toString() {
        // * Tampilkan cuplikan bio saja supaya log tidak terlalu panjang.
        return "Artist{" +
                "artistId='" + artistId + '\'' +
                ", artistName='" + artistName + '\'' +
                ", bio='" + (bio != null ? bio.substring(0, Math.min(bio.length(), 50)) : "none") + "...'" +
                ", totalSongs=" + songs.size() +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        // * Dua artist dianggap sama jika memiliki artistId yang sama.
        if (this == o) return true;
        if (!(o instanceof Artist)) return false;
        Artist other = (Artist) o;
        return artistId != null && artistId.equals(other.artistId);
    }

    @Override
    public int hashCode() {
        // * Pola umum untuk entity JPA.
        return getClass().hashCode();
    }
}
