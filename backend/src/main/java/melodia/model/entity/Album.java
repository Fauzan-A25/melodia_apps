package melodia.model.entity;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

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
    @JoinColumn(name = "artist_id", nullable = false, referencedColumnName = "artist_id")
    @JsonIgnore // ⬅️ hindari serialize proxy langsung
    private Artist artist;

    @Column(name = "release_year", nullable = false)
    private int releaseYear;

    // Genres associated with this album
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "album_genres",
        joinColumns = @JoinColumn(name = "album_id"),
        inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    @JsonIgnore // ⬅️ untuk list besar, kirim via DTO saja
    private List<Genre> genres = new ArrayList<>();

    // Lagu-lagu dalam album ini
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "album_songs",
        joinColumns = @JoinColumn(name = "album_id"),
        inverseJoinColumns = @JoinColumn(name = "song_id")
    )
    @JsonIgnore // ⬅️ sama, kirim via DTO kalau perlu
    private List<Song> songs = new ArrayList<>();

    @Column(name = "cover_emoji", length = 10)
    private String coverEmoji;

    public Album(String title, Artist artist, int releaseYear) {
        this.title = title;
        this.artist = artist;
        this.releaseYear = releaseYear;
    }

    protected Album() {}

    @PrePersist
    protected void onCreate() {
        if (this.albumId == null) {
            this.albumId = UUID.randomUUID().toString();
        }
        if (this.coverEmoji == null) {
            this.coverEmoji = "💿";
        }
    }

    public String getAlbumId() { return albumId; }
    public void setAlbumId(String albumId) { this.albumId = albumId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Artist getArtist() { return artist; }
    public void setArtist(Artist artist) { this.artist = artist; }

    public int getReleaseYear() { return releaseYear; }
    public void setReleaseYear(int releaseYear) { this.releaseYear = releaseYear; }

    public List<Genre> getGenres() { return genres; }
    public void setGenres(List<Genre> genres) {
        this.genres = genres != null ? genres : new ArrayList<>();
    }

    public List<Song> getSongs() { return songs; }
    public void setSongs(List<Song> songs) {
        this.songs = songs != null ? songs : new ArrayList<>();
    }

    public String getCoverEmoji() { return coverEmoji; }
    public void setCoverEmoji(String coverEmoji) { this.coverEmoji = coverEmoji; }

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

    public void addGenre(Genre genre) {
        if (genre != null && !this.genres.contains(genre)) {
            this.genres.add(genre);
        }
    }

    public void removeGenre(Genre genre) {
        if (genre != null) {
            this.genres.remove(genre);
        }
    }

    public int getTotalSongs() {
        return this.songs.size();
    }

    public boolean search(String keyword) {
        if (keyword == null || keyword.isEmpty()) {
            return false;
        }
        String text = keyword.toLowerCase();
        return (this.title != null && this.title.toLowerCase().contains(text));
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Album)) return false;
        Album other = (Album) o;
        return albumId != null && albumId.equals(other.getAlbumId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Album{" +
                "albumId='" + albumId + '\'' +
                ", title='" + title + '\'' +
                ", artist=" + (artist != null ? artist.getArtistName() : "null") +
                ", releaseYear=" + releaseYear +
                ", totalSongs=" + songs.size() +
                ", totalGenres=" + genres.size() +
                '}';
    }
}
