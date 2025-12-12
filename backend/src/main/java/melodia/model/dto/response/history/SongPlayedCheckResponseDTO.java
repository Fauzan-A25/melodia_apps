package melodia.model.dto.response.history;

public class SongPlayedCheckResponseDTO {
    private String userId;
    private String songId;
    private boolean hasPlayed;

    public SongPlayedCheckResponseDTO() {}

    public SongPlayedCheckResponseDTO(String userId, String songId, boolean hasPlayed) {
        this.userId = userId;
        this.songId = songId;
        this.hasPlayed = hasPlayed;
    }

    // Getters & Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getSongId() { return songId; }
    public void setSongId(String songId) { this.songId = songId; }

    public boolean isHasPlayed() { return hasPlayed; }
    public void setHasPlayed(boolean hasPlayed) { this.hasPlayed = hasPlayed; }
}
