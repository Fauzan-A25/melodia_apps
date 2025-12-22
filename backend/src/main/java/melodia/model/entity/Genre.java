package melodia.model.entity;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

/**
 * Genre musik di Melodia.
 * Digunakan untuk mengelompokkan lagu dan album (misalnya Pop, Rock, Jazz).
 */
@Entity
@Table(name = "genres")
public class Genre {

    // ==================== Identitas & informasi dasar ====================

    @Id
    private String id; // * ID genre, bisa di-generate di service (mis. "GENPOP001" atau UUID).

    @Column(name = "name", unique = true, nullable = false)
    private String name; // * Nama genre yang tampil di UI (contoh: "Pop", "Lo-fi", "Rock").

    @Column(name = "description")
    private String description; // * Deskripsi singkat genre (optional, untuk halaman detail).

    // ==================== Relasi dengan lagu ====================

    // * Satu genre bisa dipakai oleh banyak lagu, dan satu lagu bisa memiliki banyak genre.
    @ManyToMany(mappedBy = "genres")
    @JsonIgnore // * Jangan serialize balik ke songs agar tidak terjadi loop / payload raksasa.
    private List<Song> songs = new ArrayList<>();

    // ==================== Constructors ====================

    // * Diperlukan oleh JPA.
    public Genre() {}

    // * Membuat genre baru hanya dengan nama (ID bisa diisi belakangan).
    public Genre(String name) {
        this.name = name;
    }

    // * Membuat genre dengan ID, nama, dan deskripsi sekaligus.
    public Genre(String id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }

    // ==================== Getters ====================

    public String getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public List<Song> getSongs() { return songs; }

    // ==================== Setters ====================

    public void setId(String id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }

    public void setSongs(List<Song> songs) {
        // * Boleh null-safe kalau mau konsisten dengan entity lain:
        //   this.songs = (songs != null) ? songs : new ArrayList<>();
        this.songs = songs;
    }
}
