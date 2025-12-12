package melodia.model.dto.response.history;

public class HistoryResponseDTO {
    private String userId;
    private int playedSongsCount;
    private boolean exists;

    public HistoryResponseDTO() {}

    public HistoryResponseDTO(String userId, int playedSongsCount, boolean exists) {
        this.userId = userId;
        this.playedSongsCount = playedSongsCount;
        this.exists = exists;
    }

    // Getters & Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public int getPlayedSongsCount() { return playedSongsCount; }
    public void setPlayedSongsCount(int playedSongsCount) { this.playedSongsCount = playedSongsCount; }

    public boolean isExists() { return exists; }
    public void setExists(boolean exists) { this.exists = exists; }
}
