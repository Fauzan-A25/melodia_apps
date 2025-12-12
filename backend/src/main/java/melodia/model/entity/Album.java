package melodia.model.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Album: Koleksi lagu resmi milik satu Artist
 */
@Entity
@Table(name = "albums")
public class Album {

    @Id
    @Column(name = "album_id", length = 50, nullable = false)
    private String albumId;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    // Owner album (artist)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id", nullable = false)
    private Artist artist;

    @Column(name = "release_year", nullable = false)
    private int releaseYear;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "album_genres",
        joinColumns = @JoinColumn(name = "album_id"),
        inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private List<Genre> genres = new ArrayList<>();

    // Lagu-lagu dalam album ini (minimal 1, aggregation)
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "album_songs",
        joinColumns = @JoinColumn(name = "album_id"),
        inverseJoinColumns = @JoinColumn(name = "song_id")
    )
    private List<Song> songs = new ArrayList<>();

    // Constructor untuk Album (dari diagram)
    public Album(String title, Artist artist, int releaseYear) {
        this.title = title;
        this.artist = artist;
        this.releaseYear = releaseYear;
        // albumId sebaiknya di-set lewat ID generator/utility saat save
    }

    protected Album() {}

    // ==================== Getters & Setters ====================
    public String getAlbumId() { return albumId; }
    public void setAlbumId(String albumId) { this.albumId = albumId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Artist getArtist() { return artist; }
    public void setArtist(Artist artist) { this.artist = artist; }

    public int getReleaseYear() { return releaseYear; }
    public void setReleaseYear(int releaseYear) { this.releaseYear = releaseYear; }

    public List<Genre> getGenres() { return genres; }
    public void setGenres(List<Genre> genres) { this.genres = genres != null ? genres : new ArrayList<>(); }

    /**
     * Get semua lagu dalam album (implements Playable)
     */
    public List<Song> getSongs() { return songs; }
    public void setSongs(List<Song> songs) {
        this.songs = songs != null ? songs : new ArrayList<>();
    }

    // ==================== Helper Methods ====================

    public void addSong(Song song) {
        if (song != null && !this.songs.contains(song)) {
            this.songs.add(song);
        }
    }

    public void removeSong(Song song) {
        if (song != null) {
            this.songs.remove(song);
        }
    }

    /**
     * Search album by keyword (implements Searchable)
     * Search di title atau genre
     */
    public boolean search(String keyword) {
        if (keyword == null || keyword.isEmpty()) {
            return false;
        }
        String text = keyword.toLowerCase();
        return (this.title != null && this.title.toLowerCase().contains(text)) ||
               (this.genres != null && this.genres.stream().anyMatch(genre -> genre.getName().toLowerCase().contains(text)));
    }
}
