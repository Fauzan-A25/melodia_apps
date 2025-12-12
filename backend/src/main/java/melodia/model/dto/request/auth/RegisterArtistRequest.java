package melodia.model.dto.request.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterArtistRequest {

    @NotBlank(message = "Artist name is required")
    @Size(min = 3, max = 100, message = "Artist name must be between 3 and 100 characters")
    private String artistName;

    // Bio optional, hanya batasi panjang
    @Size(max = 1000, message = "Bio cannot exceed 1000 characters")
    private String bio;

    public RegisterArtistRequest() {
    }

    public RegisterArtistRequest(String artistName, String bio) {
        this.artistName = artistName;
        this.bio = bio;
    }

    public String getArtistName() {
        return artistName;
    }

    public void setArtistName(String artistName) {
        this.artistName = artistName;
    }

    // handle null bio gracefully
    public String getBio() {
        return bio != null ? bio : "";
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}
