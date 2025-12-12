// src/main/java/melodia/model/dto/response/ArtistDropdownResponse.java
package melodia.model.dto.response;

public class ArtistDropdownResponse {

    private String artistId;
    private String artistName;
    private String bio;

    public ArtistDropdownResponse() {
    }

    public ArtistDropdownResponse(String artistId, String artistName, String bio) {
        this.artistId = artistId;
        this.artistName = artistName;
        this.bio = bio;
    }

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
}
