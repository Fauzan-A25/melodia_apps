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

@Entity
@Table(name = "songs")
public class Song {

    @Id
    @Column(name = "song_id", length = 50, nullable = false, unique = true)
    private String songId;

    @Column(name = "title", nullable = false, length = 100, unique = true)
    private String title;

    // Opsional: cache nama artist; bisa di-drop dari DB kalau tidak dibutuhkan
    @Column(name = "artist_name", length = 100)
    private String artistName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id", nullable = false)
    @JsonIgnoreProperties({
        "songs",
        "hibernateLazyInitializer",
        "handler"
    })
    private Artist artist;

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
    })
    private List<Genre> genres = new ArrayList<>();

    @Column(name = "duration", nullable = false)
    private int duration;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "release_year", nullable = false)
    private int releaseYear;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    // ==================== Constructors ====================

    public Song(String title, Artist artist, String filePath, int duration, int releaseYear) {
        this.title = title;
        this.artist = artist;
        this.artistName = artist != null ? artist.getArtistName() : null;
        this.filePath = filePath;
        this.duration = duration;
        this.releaseYear = releaseYear;
        this.uploadedAt = LocalDateTime.now();
    }

    public Song(String title, Artist artist, String filePath, int duration, int releaseYear, Genre genreEntity) {
        this(title, artist, filePath, duration, releaseYear);
        if (genreEntity != null) {
            this.genres.add(genreEntity);
        }
    }

    public Song() {
        this.uploadedAt = LocalDateTime.now();
    }

    // ==================== Getters ====================

    public String getSongId() {
        return songId;
    }

    public String getTitle() {
        return title;
    }

    public String getArtistName() {
        return artistName;
    }

    public List<Genre> getGenres() {
        return genres;
    }

    public int getDuration() {
        return duration;
    }

    public String getFilePath() {
        return filePath;
    }

    public int getReleaseYear() {
        return releaseYear;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public Artist getArtist() {
        return artist;
    }

    // ==================== Setters ====================

    public void setSongId(String songId) {
        this.songId = songId;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * Jika mau keep cache nama artist di kolom artist_name.
     * Kalau di DB kolomnya di-drop, hapus field + setter ini.
     */
    public void setArtistName(String artistName) {
        this.artistName = artistName;
    }

    public void setGenres(List<Genre> genres) {
        this.genres = genres != null ? genres : new ArrayList<>();
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public void setReleaseYear(int releaseYear) {
        this.releaseYear = releaseYear;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public void setArtist(Artist artist) {
        this.artist = artist;
        // Sync optional cache nama artist
        if (artist != null) {
            this.artistName = artist.getArtistName();
        }
    }

    // ==================== Business Method ====================

    public boolean search(String keyword) {
        if (keyword == null || keyword.isEmpty()) {
            return false;
        }
        return (this.title != null && this.title.contains(keyword)) ||
               (this.artistName != null && this.artistName.contains(keyword));
    }
}
