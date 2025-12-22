package melodia.model.dto.response.admin;

public class GenreResponse {
    private final String id;
    private final String name;
    private final String description;
    private final int songCount;

    public GenreResponse(String id, String name, String description, int songCount) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.songCount = songCount;
    }

    // Getters
    public String getId() { 
        return id; 
    }
    
    public String getName() { 
        return name; 
    }
    
    public String getDescription() { 
        return description; 
    }
    
    public int getSongCount() { 
        return songCount; 
    }
}
