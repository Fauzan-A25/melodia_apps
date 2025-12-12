package melodia.model.dto.request.admin;

import jakarta.validation.constraints.NotBlank;

public class GenreRequest {
    @NotBlank(message = "Genre name is required")
    private String name;  // ✅ Changed from genreName to name
    
    private String description;

    // Getters and Setters
    public String getName() { 
        return name; 
    }
    
    public void setName(String name) { 
        this.name = name; 
    }
    
    public String getDescription() { 
        return description; 
    }
    
    public void setDescription(String description) { 
        this.description = description; 
    }
}
