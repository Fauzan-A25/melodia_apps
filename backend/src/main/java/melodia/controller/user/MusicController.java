package melodia.controller.user;

import java.io.IOException;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import melodia.model.dto.common.ApiResponse;
import melodia.model.entity.Song;
import melodia.model.service.music.FileStorageService;
import melodia.model.service.music.MusicService;

@RestController
@RequestMapping("/api")
public class MusicController {

    private static final Logger logger = LoggerFactory.getLogger(MusicController.class);

    @Autowired
    private MusicService musicService;
    
    @Autowired
    private FileStorageService fileStorageService;

    // ==================== SONG ENDPOINTS ====================

    @GetMapping("/songs")
    public ResponseEntity<ApiResponse<List<Song>>> getAllSongs() {
        logger.debug("Fetching all songs");
        List<Song> songs = musicService.getAllSongs();
        logger.info("✅ Found {} songs", songs.size());
        return ResponseEntity.ok(ApiResponse.success("Songs fetched successfully", songs));
    }

    @GetMapping("/songs/{id}")
    public ResponseEntity<ApiResponse<Song>> getSongById(@PathVariable String id) {
        logger.debug("Fetching song by id: {}", id);
        Song song = musicService.getSongById(id);
        if (song == null) {
            logger.warn("Song not found: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Song not found"));
        }
        logger.info("✅ Song found: {}", song.getTitle());
        return ResponseEntity.ok(ApiResponse.success("Song fetched successfully", song));
    }

    @GetMapping("/songs/search")
    public ResponseEntity<ApiResponse<List<Song>>> searchSongs(@RequestParam String query) {
        logger.debug("Searching songs with query: {}", query);
        List<Song> songsByTitle = musicService.searchByTitle(query);
        
        if (songsByTitle.isEmpty()) {
            logger.debug("No songs found by title, searching by artist");
            List<Song> songsByArtist = musicService.searchByArtist(query);
            logger.info("✅ Found {} songs by artist", songsByArtist.size());
            return ResponseEntity.ok(ApiResponse.success("Songs found by artist", songsByArtist));
        }
        
        logger.info("✅ Found {} songs by title", songsByTitle.size());
        return ResponseEntity.ok(ApiResponse.success("Songs found by title", songsByTitle));
    }

    @GetMapping("/songs/search/title")
    public ResponseEntity<ApiResponse<List<Song>>> searchByTitle(@RequestParam String query) {
        logger.debug("Searching songs by title: {}", query);
        List<Song> songs = musicService.searchByTitle(query);
        logger.info("✅ Found {} songs", songs.size());
        return ResponseEntity.ok(ApiResponse.success("Songs found by title", songs));
    }

    @GetMapping("/songs/search/artist")
    public ResponseEntity<ApiResponse<List<Song>>> searchByArtist(@RequestParam String query) {
        logger.debug("Searching songs by artist: {}", query);
        List<Song> songs = musicService.searchByArtist(query);
        logger.info("✅ Found {} songs", songs.size());
        return ResponseEntity.ok(ApiResponse.success("Songs found by artist", songs));
    }

    @GetMapping("/songs/filter/genre")
    public ResponseEntity<ApiResponse<List<Song>>> filterByGenre(@RequestParam String name) {
        logger.debug("Filtering songs by genre: {}", name);
        List<Song> songs = musicService.filterByGenre(name);
        logger.info("✅ Found {} songs for genre: {}", songs.size(), name);
        return ResponseEntity.ok(ApiResponse.success("Songs filtered by genre", songs));
    }

    @GetMapping("/songs/filter/year")
    public ResponseEntity<ApiResponse<List<Song>>> filterByYear(@RequestParam int year) {
        logger.debug("Filtering songs by year: {}", year);
        List<Song> songs = musicService.filterByReleaseYear(year);
        logger.info("✅ Found {} songs for year: {}", songs.size(), year);
        return ResponseEntity.ok(ApiResponse.success("Songs filtered by year", songs));
    }

    /**
     * Stream audio file from Supabase
     * GET /api/songs/stream/{id}
     */
    @GetMapping("/songs/stream/{id}")
    public ResponseEntity<Resource> streamSong(@PathVariable String id) {
        logger.info("Streaming song request for id: {}", id);
        
        try {
            // Get song from database
            Song song = musicService.getSongById(id);
            if (song == null) {
                logger.error("Song not found in database: {}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            String filePath = song.getFilePath();
            logger.debug("Streaming song: {}, File path: {}", song.getTitle(), filePath);

            // Load file as resource (from Supabase)
            Resource resource = fileStorageService.loadFileAsResource(filePath);

            // ✅ FIX: Check if resource exists (for UrlResource, this checks if URL is valid)
            if (!resource.exists()) {
                logger.error("File not found at Supabase: {}", filePath);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            // ✅ FIX: Detect content type from file extension instead of file probe
            String contentType = detectContentTypeFromFilename(filePath);
            logger.debug("Content-Type: {}, Resource URL: {}", contentType, resource.getURL());

            // Return audio file with proper headers
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .body(resource);

        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument while streaming song {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (IOException e) {
            logger.error("IO error while streaming song {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (RuntimeException e) {
            logger.error("Runtime error while streaming song {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * ✅ NEW: Detect content type from filename extension (works for remote files)
     */
    private String detectContentTypeFromFilename(String filename) {
        if (filename == null) {
            return "audio/mpeg";
        }
        
        String lowerFilename = filename.toLowerCase();
        
        if (lowerFilename.endsWith(".mp3")) {
            return "audio/mpeg";
        } else if (lowerFilename.endsWith(".wav")) {
            return "audio/wav";
        } else if (lowerFilename.endsWith(".ogg")) {
            return "audio/ogg";
        } else if (lowerFilename.endsWith(".flac")) {
            return "audio/flac";
        } else if (lowerFilename.endsWith(".m4a")) {
            return "audio/mp4";
        } else if (lowerFilename.endsWith(".aac")) {
            return "audio/aac";
        } else if (lowerFilename.endsWith(".wma")) {
            return "audio/x-ms-wma";
        } else {
            logger.debug("Unknown file extension for {}, using default audio/mpeg", filename);
            return "audio/mpeg";
        }
    }
}
