package melodia.controller.user;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import melodia.model.dto.common.ApiResponse;
import melodia.model.entity.Album;
import melodia.model.entity.Song;
import melodia.model.service.music.AlbumService;

@RestController
@RequestMapping("/api/albums")
public class AlbumController {

    private static final Logger logger = LoggerFactory.getLogger(AlbumController.class);

    @Autowired
    private AlbumService albumService;

    // ==================== READ OPERATIONS ====================

    /**
     * GET semua album - untuk home page & admin
     * GET /api/albums
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllAlbums() {
        try {
            List<Album> albums = albumService.getAllAlbums();
            
            // ✅ Mapping langsung di controller (hindari Hibernate proxy error)
            List<Map<String, Object>> albumList = albums.stream()
                .map(album -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("albumId", album.getAlbumId());
                    dto.put("title", album.getTitle());
                    dto.put("releaseYear", album.getReleaseYear());
                    dto.put("coverEmoji", album.getCoverEmoji());
                    
                    // ✅ Safe artist name extraction
                    String artistName = "Unknown";
                    if (album.getArtist() != null) {
                        try {
                            artistName = album.getArtist().getArtistName();
                        } catch (Exception e) {
                            artistName = "Unknown Artist";
                        }
                    }
                    dto.put("artistName", artistName);
                    
                    // ✅ Safe genre names extraction
                    List<String> genreNames = List.of();
                    try {
                        genreNames = album.getGenres().stream()
                            .map(g -> g.getName())
                            .collect(Collectors.toList());
                    } catch (Exception e) {
                        // Ignore lazy load error
                    }
                    dto.put("genreNames", genreNames);
                    
                    // ✅ Safe song count
                    int songCount = 0;
                    try {
                        songCount = album.getSongs().size();
                    } catch (Exception e) {
                        // Ignore lazy load error
                    }
                    dto.put("songCount", songCount);
                    
                    return dto;
                })
                .collect(Collectors.toList());
                
            return ResponseEntity.ok(ApiResponse.success("Albums retrieved successfully", albumList));
        } catch (Exception e) {
            logger.error("Error fetching all albums: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch albums"));
        }
    }

    /**
     * GET album berdasarkan ID - untuk detail album page
     * GET /api/albums/{albumId}
     */
    @GetMapping("/{albumId}")
    public ResponseEntity<ApiResponse<?>> getAlbumById(@PathVariable String albumId) {
        try {
            Album album = albumService.getAlbumById(albumId);
            
            // ✅ Detail page mapping (lebih lengkap)
            Map<String, Object> dto = new HashMap<>();
            dto.put("albumId", album.getAlbumId());
            dto.put("title", album.getTitle());
            dto.put("releaseYear", album.getReleaseYear());
            dto.put("coverEmoji", album.getCoverEmoji());
            
            // Artist (safe)
            Map<String, Object> artistDto = new HashMap<>();
            if (album.getArtist() != null) {
                try {
                    artistDto.put("artistId", album.getArtist().getArtistId());
                    artistDto.put("artistName", album.getArtist().getArtistName());
                } catch (Exception e) {
                    // Fallback
                }
            }
            dto.put("artist", artistDto);
            
            // Genres
            List<Map<String, Object>> genres = List.of();
            try {
                genres = album.getGenres().stream()
                    .map(g -> {
                        Map<String, Object> genreDto = new HashMap<>();
                        genreDto.put("id", g.getId());
                        genreDto.put("name", g.getName());
                        return genreDto;
                    })
                    .collect(Collectors.toList());
            } catch (Exception e) {
                // Ignore
            }
            dto.put("genres", genres);
            
            // Songs (untuk player)
            List<Map<String, Object>> songs = List.of();
            try {
                songs = album.getSongs().stream()
                    .map(s -> {
                        Map<String, Object> songDto = new HashMap<>();
                        songDto.put("songId", s.getSongId());
                        songDto.put("title", s.getTitle());
                        return songDto;
                    })
                    .collect(Collectors.toList());
            } catch (Exception e) {
                // Ignore
            }
            dto.put("songs", songs);
            
            return ResponseEntity.ok(ApiResponse.success("Album retrieved successfully", dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error fetching album: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to fetch album"));
        }
    }

    /**
     * GET semua lagu dalam album - untuk music player
     * GET /api/albums/{albumId}/songs
     */
    @GetMapping("/{albumId}/songs")
    public ResponseEntity<ApiResponse<List<Song>>> getAlbumSongs(@PathVariable String albumId) {
        try {
            List<Song> songs = albumService.getAlbumSongs(albumId);
            return ResponseEntity.ok(ApiResponse.success("Album songs retrieved successfully", songs));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to fetch album songs"));
        }
    }

    /**
     * GET album berdasarkan artist
     * GET /api/albums/artist/{artistId}
     */
    @GetMapping("/artist/{artistId}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAlbumsByArtist(@PathVariable String artistId) {
        try {
            List<Album> albums = albumService.getAlbumsByArtist(artistId);
            
            // ✅ Sama seperti getAllAlbums
            List<Map<String, Object>> albumList = albums.stream()
                .map(album -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("albumId", album.getAlbumId());
                    dto.put("title", album.getTitle());
                    dto.put("releaseYear", album.getReleaseYear());
                    dto.put("coverEmoji", album.getCoverEmoji());
                    dto.put("artistName", album.getArtist() != null ? album.getArtist().getArtistName() : null);
                    dto.put("genreNames", album.getGenres().stream().map(g -> g.getName()).collect(Collectors.toList()));
                    dto.put("songCount", album.getSongs().size());
                    return dto;
                })
                .collect(Collectors.toList());
                
            return ResponseEntity.ok(ApiResponse.success("Albums by artist retrieved successfully", albumList));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to fetch artist albums"));
        }
    }

    // ==================== SEARCH & FILTER OPERATIONS ====================

    /**
     * GET search album berdasarkan title
     * GET /api/albums/search?title={query}
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<?>> searchAlbums(@RequestParam String title) {
        try {
            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Search query cannot be empty"));
            }
            List<Album> albums = albumService.searchByTitle(title);
            
            // ✅ Mapping search results
            List<Map<String, Object>> albumList = albums.stream()
                .map(album -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("albumId", album.getAlbumId());
                    dto.put("title", album.getTitle());
                    dto.put("releaseYear", album.getReleaseYear());
                    dto.put("coverEmoji", album.getCoverEmoji());
                    dto.put("artistName", album.getArtist() != null ? album.getArtist().getArtistName() : null);
                    return dto;
                })
                .collect(Collectors.toList());
                
            return ResponseEntity.ok(ApiResponse.success("Albums searched successfully", albumList));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Search failed"));
        }
    }

    /**
     * GET filter album berdasarkan genre
     * GET /api/albums/genre/{genreName}
     */
    @GetMapping("/genre/{genreName}")
    public ResponseEntity<ApiResponse<?>> filterByGenre(@PathVariable String genreName) {
        try {
            List<Album> albums = albumService.filterByGenre(genreName);
            
            List<Map<String, Object>> albumList = albums.stream()
                .map(album -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("albumId", album.getAlbumId());
                    dto.put("title", album.getTitle());
                    dto.put("releaseYear", album.getReleaseYear());
                    dto.put("coverEmoji", album.getCoverEmoji());
                    dto.put("artistName", album.getArtist() != null ? album.getArtist().getArtistName() : null);
                    return dto;
                })
                .collect(Collectors.toList());
                
            return ResponseEntity.ok(ApiResponse.success("Albums filtered by genre", albumList));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Filter failed"));
        }
    }

    /**
     * GET filter album berdasarkan tahun rilis
     * GET /api/albums/year/{year}
     */
    @GetMapping("/year/{year}")
    public ResponseEntity<ApiResponse<?>> filterByYear(@PathVariable int year) {
        try {
            List<Album> albums = albumService.filterByReleaseYear(year);
            
            List<Map<String, Object>> albumList = albums.stream()
                .map(album -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("albumId", album.getAlbumId());
                    dto.put("title", album.getTitle());
                    dto.put("releaseYear", album.getReleaseYear());
                    dto.put("coverEmoji", album.getCoverEmoji());
                    dto.put("artistName", album.getArtist() != null ? album.getArtist().getArtistName() : null);
                    return dto;
                })
                .collect(Collectors.toList());
                
            return ResponseEntity.ok(ApiResponse.success("Albums filtered by year", albumList));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Filter failed"));
        }
    }

    // ==================== CREATE OPERATION ====================

    /**
     * POST create album baru
     * POST /api/albums?title={title}&artistId={artistId}&releaseYear={year}&genreNames={genres}
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createAlbum(
            @RequestParam String title,
            @RequestParam String artistId,
            @RequestParam int releaseYear,
            @RequestParam(required = false) List<String> genreNames) {
        try {
            // Validation
            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Album title is required"));
            }
            if (artistId == null || artistId.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Artist ID is required"));
            }
            if (releaseYear < 1900 || releaseYear > 2100) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid release year"));
            }

            Album album = albumService.createAlbum(title, artistId, releaseYear, genreNames);
            
            // ✅ Return simple response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Album created successfully");
            response.put("albumId", album.getAlbumId());
            response.put("title", album.getTitle());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Album created successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to create album: " + e.getMessage()));
        }
    }

    // ==================== UPDATE OPERATION ====================

    /**
     * PUT update album
     * PUT /api/albums/{albumId}?title={newTitle}&releaseYear={newYear}
     */
    @PutMapping("/{albumId}")
    public ResponseEntity<?> updateAlbum(
            @PathVariable String albumId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Integer releaseYear) {
        try {
            // Validation
            if ((title == null || title.trim().isEmpty()) && releaseYear == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "At least one field (title or releaseYear) must be provided"));
            }

            Album updatedAlbum = albumService.updateAlbum(albumId, title, releaseYear);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Album updated successfully");
            response.put("albumId", updatedAlbum.getAlbumId());
            response.put("title", updatedAlbum.getTitle());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to update album"));
        }
    }

    // ==================== DELETE OPERATION ====================

    /**
     * DELETE hapus album
     * DELETE /api/albums/{albumId}
     */
    @DeleteMapping("/{albumId}")
    public ResponseEntity<ApiResponse<?>> deleteAlbum(@PathVariable String albumId) {
        try {
            albumService.deleteAlbum(albumId);
            return ResponseEntity.ok(ApiResponse.success("Album deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to delete album"));
        }
    }

    // ==================== ALBUM-SONG OPERATIONS ====================

    /**
     * POST tambah lagu ke album
     * POST /api/albums/{albumId}/songs/{songId}
     */
    @PostMapping("/{albumId}/songs/{songId}")
    public ResponseEntity<ApiResponse<?>> addSongToAlbum(
            @PathVariable String albumId,
            @PathVariable String songId) {
        try {
            Album updatedAlbum = albumService.addSongToAlbum(albumId, songId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("albumId", updatedAlbum.getAlbumId());
            response.put("songCount", updatedAlbum.getTotalSongs());
            
            return ResponseEntity.ok(ApiResponse.success("Song added to album successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to add song to album"));
        }
    }

    /**
     * DELETE hapus lagu dari album
     * DELETE /api/albums/{albumId}/songs/{songId}
     */
    @DeleteMapping("/{albumId}/songs/{songId}")
    public ResponseEntity<ApiResponse<?>> removeSongFromAlbum(
            @PathVariable String albumId,
            @PathVariable String songId) {
        try {
            Album updatedAlbum = albumService.removeSongFromAlbum(albumId, songId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("albumId", updatedAlbum.getAlbumId());
            response.put("songCount", updatedAlbum.getTotalSongs());
            
            return ResponseEntity.ok(ApiResponse.success("Song removed from album successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to remove song from album"));
        }
    }

    // ==================== STATISTICS ====================

    /**
     * GET total albums count
     * GET /api/albums/stats/count
     */
    @GetMapping("/stats/count")
    public ResponseEntity<?> getTotalAlbumsCount() {
        try {
            long count = albumService.getTotalAlbums();
            return ResponseEntity.ok(Map.of("totalAlbums", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to fetch album count"));
        }
    }

    /**
     * GET total songs in album
     * GET /api/albums/{albumId}/stats/songs
     */
    @GetMapping("/{albumId}/stats/songs")
    public ResponseEntity<?> getTotalSongsInAlbum(@PathVariable String albumId) {
        try {
            int count = albumService.getTotalSongsInAlbum(albumId);
            return ResponseEntity.ok(Map.of(
                "albumId", albumId,
                "totalSongs", count
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Failed to fetch song count"));
        }
    }
}
