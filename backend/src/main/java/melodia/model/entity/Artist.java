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

@Entity
@Table(name = "artists")
public class Artist {

    @Id
    @Column(name = "artist_id", length = 36, nullable = false, updatable = false)
    private String artistId;

    @Column(name = "artist_name", nullable = false, unique = true, length = 100)
    private String artistName;

    @Column(name = "bio", length = 1000)
    private String bio;

    @OneToMany(mappedBy = "artist", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Song> songs = new ArrayList<>();

    // ==================== Constructors ====================

    public Artist(String artistName, String bio) {
        this.artistName = artistName;
        this.bio = bio;
    }

    protected Artist() {
    }

    // ==================== Lifecycle Callback ====================

    @PrePersist
    protected void onCreate() {
        if (this.artistId == null) {
            this.artistId = generateArtistId();
        }
    }

    private String generateArtistId() {
        String prefix = "ART";
        String timePart = String.valueOf(System.currentTimeMillis());
        // ambil 11 digit terakhir → ART + 11 digit = 14, tambahkan 1 random = 15
        timePart = timePart.substring(timePart.length() - 11);
        int random = (int) (Math.random() * 10); // 0–9
        return prefix + timePart + random;
    }


    // ==================== Business Methods ====================

    public void addSong(Song song) {
        if (song != null && !songs.contains(song)) {
            songs.add(song);
            song.setArtist(this);
        }
    }

    public void removeSong(Song song) {
        if (song != null) {
            songs.remove(song);
            if (song.getArtist() == this) {
                song.setArtist(null);
            }
        }
    }

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
        this.songs = songs != null ? songs : new ArrayList<>();
    }

    // ==================== Override Methods ====================

    @Override
    public String toString() {
        return "Artist{" +
                "artistId='" + artistId + '\'' +
                ", artistName='" + artistName + '\'' +
                ", bio='" + (bio != null ? bio.substring(0, Math.min(bio.length(), 50)) : "none") + "...'" +
                ", totalSongs=" + songs.size() +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Artist)) return false;
        Artist other = (Artist) o;
        return artistId != null && artistId.equals(other.artistId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
