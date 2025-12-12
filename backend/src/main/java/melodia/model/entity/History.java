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

@Entity
@Table(name = "histories")
public class History {

    @Id
    @Column(name = "user_id")
    private String userId;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "history_songs",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "song_id")
    )
    @OrderColumn(name = "play_order") // ✅ Tambah kolom order
    private List<Song> playedSongs = new ArrayList<>();

    // Constructors
    public History() {}

    public History(String userId) {
        this.userId = userId;
    }

    // Getters & Setters
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
        this.playedSongs = playedSongs != null ? playedSongs : new ArrayList<>();
    }

    // ✅ Business Method: Move to front (remove old + add first)
    public void addPlayedSong(Song song) {
        if (song == null) return;
        
        // Remove kalau sudah ada (untuk move to front)
        this.playedSongs.removeIf(s -> s.getSongId().equals(song.getSongId()));
        
        // Add di posisi pertama
        this.playedSongs.add(0, song);
    }

    public void removePlayedSong(Song song) {
        if (song != null) {
            this.playedSongs.removeIf(s -> s.getSongId().equals(song.getSongId()));
        }
    }

    public int getPlayedSongsCount() {
        return this.playedSongs.size();
    }
    
    public boolean hasPlayedSong(Song song) {
        return this.playedSongs.stream()
            .anyMatch(s -> s.getSongId().equals(song.getSongId()));
    }

    @Override
    public String toString() {
        return "History{" +
                "userId='" + userId + '\'' +
                ", playedSongsCount=" + playedSongs.size() +
                '}';
    }
}
