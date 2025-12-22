package melodia.model.dto.response.music;

import java.util.List;

import melodia.model.entity.Song;

public class PlayedSongsResponseDTO {
    private String userId;
    private int totalSongs;
    private List<Song> songs;

    public PlayedSongsResponseDTO() {}

    public PlayedSongsResponseDTO(String userId, List<Song> songs) {
        this.userId = userId;
        this.songs = songs;
        this.totalSongs = songs != null ? songs.size() : 0;
    }

    // Getters & Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public int getTotalSongs() { return totalSongs; }
    public void setTotalSongs(int totalSongs) { this.totalSongs = totalSongs; }

    public List<Song> getSongs() { return songs; }
    public void setSongs(List<Song> songs) { 
        this.songs = songs;
        this.totalSongs = songs != null ? songs.size() : 0;
    }
}
