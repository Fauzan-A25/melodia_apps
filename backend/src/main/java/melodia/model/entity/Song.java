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

    @Column(name = "artist_name", nullable = false, length = 100)
    private String artistName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id")
    @JsonIgnoreProperties({
        "uploadedSongs",
        "playlists",
        "password",
        "hibernateLazyInitializer",
        "handler"
    }) // ⬅ batasi field Artist yang dikirim agar tidak loop
    private Artist artist;

    // Relasi Many-to-Many ke Genre
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
    }) // ⬅ jangan serialize Genre.songs lagi
    private List<Genre> genres = new ArrayList<>();

    @Column(name = "duration", nullable = false) // Dalam detik
    private int duration;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "release_year", nullable = false)
    private int releaseYear;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    // Constructors
    public Song(String title, String artistName, String filePath, String genre) {
        this.title = title;
        this.artistName = artistName;
        this.filePath = filePath;
        this.uploadedAt = LocalDateTime.now();
    }

    public Song(String title, String artistName, String filePath, String genre, Genre genreEntity) {
        this.title = title;
        this.artistName = artistName;
        this.filePath = filePath;
        this.uploadedAt = LocalDateTime.now();
        this.genres.add(genreEntity);
    }

    public Song() {
        this.uploadedAt = LocalDateTime.now();
    }

    // Getters
    public String getSongId() { return this.songId; }
    public String getTitle() { return this.title; }
    public String getArtistName() { return this.artistName; }
    public List<Genre> getGenres() { return this.genres; }
    public int getDuration() { return this.duration; }
    public String getFilePath() { return this.filePath; }
    public int getReleaseYear() { return this.releaseYear; }
    public LocalDateTime getUploadedAt() { return this.uploadedAt; }
    public Artist getArtist() { return this.artist; }

    // Setters
    public void setSongId(String songId) { this.songId = songId; }
    public void setTitle(String title) { this.title = title; }
    public void setArtistName(String artistName) { this.artistName = artistName; }
    public void setGenres(List<Genre> genres) {
        this.genres = genres != null ? genres : new ArrayList<>();
    }
    public void setDuration(int duration) { this.duration = duration; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public void setReleaseYear(int releaseYear) { this.releaseYear = releaseYear; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    public void setArtist(Artist artist) { this.artist = artist; }

    // Simple search by keyword in title or artist
    public boolean search(String keyword) {
        return (this.title != null && this.title.contains(keyword)) ||
               (this.artistName != null && this.artistName.contains(keyword));
    }
}
