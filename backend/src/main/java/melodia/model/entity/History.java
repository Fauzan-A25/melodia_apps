// src/main/java/melodia/model/entity/History.java
package melodia.model.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

/**
 * Riwayat pemutaran lagu untuk satu user.
 * Menyimpan list lagu yang pernah diputar beserta urutannya (lagu terakhir di posisi paling depan).
 */
@Entity
@Table(name = "histories")
public class History {

    // ==================== Identitas ====================

    @Id
    @Column(name = "user_id")
    private String userId; //! Primary key sekaligus foreign key ke akun user (satu user = satu history).

    // ==================== Relasi dengan Song ====================

    // * Menyimpan daftar lagu yang pernah diputar user ini.
    // * Many-to-many karena satu lagu bisa muncul di banyak history user, dan satu user punya banyak lagu.
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "history_songs",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "song_id")
    )
    @OrderColumn(name = "play_order") // * Kolom tambahan untuk menjaga urutan lagu sesuai history.
    private List<Song> playedSongs = new ArrayList<>();

    // ==================== Constructors ====================

    // * Diperlukan oleh JPA.
    public History() {}

    // * Dipakai ketika pertama kali membuat history untuk user tertentu.
    public History(String userId) {
        this.userId = userId;
    }

    // ==================== Getters & Setters ====================

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<Song> getPlayedSongs() {
        return playedSongs;
    }

    public void setPlayedSongs(List<Song> playedSongs) {
        // * Jaga supaya list tidak pernah null agar aman dipakai di service / template.
        this.playedSongs = playedSongs != null ? playedSongs : new ArrayList<>();
    }

    // ==================== Business Methods ====================

    /**
     * Menambahkan lagu ke history dengan strategi "move to front".
     * Jika lagu sudah ada di list, entry lama dihapus lalu dimasukkan ke posisi index 0.
     */
    public void addPlayedSong(Song song) {
        if (song == null) return;

        // Hapus entri lama (kalau ada) supaya tidak ada duplikasi.
        this.playedSongs.removeIf(s -> s.getSongId().equals(song.getSongId()));

        // Tambah di posisi pertama sebagai lagu yang paling baru diputar.
        this.playedSongs.add(0, song);
    }

    /**
     * Menghapus satu lagu dari history user.
     */
    public void removePlayedSong(Song song) {
        if (song != null) {
            this.playedSongs.removeIf(s -> s.getSongId().equals(song.getSongId()));
        }
    }

    /**
     * Mengembalikan total lagu unik yang tersimpan di history.
     */
    public int getPlayedSongsCount() {
        return this.playedSongs.size();
    }

    /**
     * Mengecek apakah lagu tertentu sudah pernah diputar oleh user ini.
     */
    public boolean hasPlayedSong(Song song) {
        return song != null &&
               this.playedSongs.stream()
                   .anyMatch(s -> s.getSongId().equals(song.getSongId()));
    }

    // ==================== Override ====================

    @Override
    public String toString() {
        // * Ringkas untuk keperluan logging/debug.
        return "History{" +
                "userId='" + userId + '\'' +
                ", playedSongsCount=" + playedSongs.size() +
                '}';
    }
}
