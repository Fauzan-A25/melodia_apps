package melodia.model.dto.request.auth;

public class UpdateProfileRequest {

    private String username;  // dari Account.username
    private String email;     // dari Account.email
    private String bio;       // ⚠️ TIDAK DIGUNAKAN saat ini - reserved untuk Artist profile update

    public UpdateProfileRequest() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}
