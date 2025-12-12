package melodia.model.dto.request.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterArtistRequest {
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
    private String username;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    // ✅ Bio is optional untuk artist (bisa kosong saat registrasi)
    @Size(max = 500, message = "Bio cannot exceed 500 characters")
    private String bio;

    // Constructors
    public RegisterArtistRequest() {}

    public RegisterArtistRequest(String username, String email, String password, String bio) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.bio = bio;
    }

    // Getters & Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    // ✅ Handle null bio gracefully
    public String getBio() { 
        return bio != null && !bio.isEmpty() ? bio : ""; 
    }
    public void setBio(String bio) { this.bio = bio; }
}
