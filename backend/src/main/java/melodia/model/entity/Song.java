package melodia.model.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
 * Song - Satu track audio di Melodia.
 * Menyimpan metadata dasar (judul, artist, durasi, tahun rilis) dan informasi file audio.
 */
@Entity
@Table(name = "songs")
public class Song {

    // ==================== Identitas & metadata dasar ====================

    @Id
    @Column(name = "song_id", length = 50, nullable = false, unique = true)
    private String songId; //! ID unik lagu, di-set dari service (bisa prefix + timestamp seperti entity lain).

    @Column(name = "title", nullable = false, length = 100, unique = true)
    private String title;  // * Judul lagu yang tampil di UI.

    @Column(name = "artist_name", nullable = false, length = 100)
    private String artistName; // * Denormalized artist name for quick access

    @Column(name = "duration", nullable = false)
    private int duration;  // * Durasi lagu dalam detik.

    @Column(name = "file_path", nullable = false)
    private String filePath; // * Lokasi file audio (path lokal, URL storage, dsb.).

    @Column(name = "release_year", nullable = false)
    private int releaseYear; // * Tahun rilis lagu.

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt; // * Timestamp kapan lagu di-upload ke Melodia.

    // ==================== Relasi dengan Artist ====================

    // * Artist yang memiliki lagu ini (satu artist bisa punya banyak lagu).
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id", nullable = false)
    @JsonIgnoreProperties({
        "songs",
        "hibernateLazyInitializer",
        "handler"
    }) // * Hindari circular reference & masalah lazy loading saat serialize Artist. [web:135][web:136][web:146]
    private Artist artist;

    // ==================== Relasi dengan Genre ====================

    // * Genre yang melekat pada lagu ini (bisa lebih dari satu).
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "song_genres",
        joinColumns = @JoinColumn(name = "song_id"),
        inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    @JsonIgnoreProperties({
        "songs",
        "hibernateLazyInitializer",
        "handler"
    }) // * Cegah loop songs <-> genres saat serialisasi JSON. [web:140][web:150]
    private List<Genre> genres = new ArrayList<>();

    // ==================== Constructors ====================

    // * Dipakai saat membuat lagu baru dengan satu atau lebih genre yang di-set terpisah.
    public Song(String title, Artist artist, String filePath, int duration, int releaseYear) {
        this.title = title;
        this.artist = artist;
        this.filePath = filePath;
        this.duration = duration;
        this.releaseYear = releaseYear;
        this.uploadedAt = LocalDateTime.now();
    }

    // * Versi convenience yang langsung mengisi satu genre pertama.
    public Song(String title, Artist artist, String filePath, int duration,
                int releaseYear, Genre genreEntity) {
        this(title, artist, filePath, duration, releaseYear);
        if (genreEntity != null) {
            this.genres.add(genreEntity);
        }
    }

    // * Diperlukan oleh JPA.
    public Song() {
        this.uploadedAt = LocalDateTime.now();
    }

    // ==================== Getters ====================

    public String getSongId() { return songId; }
    public String getTitle() { return title; }
    public String getArtistName() { return artistName; }
    public List<Genre> getGenres() { return genres; }
    public int getDuration() { return duration; }
    public String getFilePath() { return filePath; }
    public int getReleaseYear() { return releaseYear; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public Artist getArtist() { return artist; }

    // ==================== Setters ====================

    public void setSongId(String songId) { this.songId = songId; }
    public void setTitle(String title) { this.title = title; }
    public void setArtistName(String artistName) { this.artistName = artistName; }

    public void setGenres(List<Genre> genres) {
        // * Jaga supaya list tidak null.
        this.genres = genres != null ? genres : new ArrayList<>();
    }

    public void setDuration(int duration) { this.duration = duration; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public void setReleaseYear(int releaseYear) { this.releaseYear = releaseYear; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }

    public void setArtist(Artist artist) {
        this.artist = artist;
    }

    // ==================== Business Method ====================

    /**
     * Pencarian sederhana berdasarkan judul lagu atau nama artist.
     * Cocok untuk filter cepat di memori sebelum/di luar query database.
     */
    public boolean search(String keyword) {
        if (keyword == null || keyword.isEmpty()) {
            return false;
        }
        String artistNameFromArtist = (this.artist != null) ? this.artist.getArtistName() : "";
        return (this.title != null && this.title.contains(keyword)) ||
               (artistNameFromArtist != null && artistNameFromArtist.contains(keyword));
    }
}
