package melodia.model.dto.request.user;

import jakarta.validation.constraints.NotBlank;

public class AddSongToHistoryRequestDTO {
    
    @NotBlank(message = "Song ID tidak boleh kosong")
    private String songId;
    
    public AddSongToHistoryRequestDTO() {}

    public AddSongToHistoryRequestDTO(String songId) {
        this.songId = songId;
    }

    // Getters & Setters
    public String getSongId() { return songId; }
    public void setSongId(String songId) { this.songId = songId; }
}
