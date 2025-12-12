package melodia.view.service.music;

import java.io.IOException;
import java.net.MalformedURLException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    private final String supabaseUrl;
    // ✅ REMOVED: private final String supabaseKey; (tidak dipakai)
    private final String supabaseServiceRoleKey;
    private final RestTemplate restTemplate;

    private static final String BUCKET_NAME = "songs";

    public FileStorageService(
            @Value("${supabase.url}") String supabaseUrl,
            // ✅ REMOVED: @Value("${supabase.key}") String supabaseKey,
            @Value("${supabase.service.role.key}") String supabaseServiceRoleKey) {
        this.supabaseUrl = supabaseUrl;
        // ✅ REMOVED: this.supabaseKey = supabaseKey;
        this.supabaseServiceRoleKey = supabaseServiceRoleKey;
        this.restTemplate = new RestTemplate();
        logger.info("FileStorageService initialized with Supabase URL: {}", supabaseUrl);
    }

    // ==================== SAVE SONG FILE TO SUPABASE ====================
    public String saveSongFile(MultipartFile file, String artistId, String title) {
        logger.info("Saving song file: {} for artist: {}", title, artistId);
        
        try {
            if (file.isEmpty()) {
                throw new IllegalArgumentException("Failed to store empty file");
            }

            // Sanitize filename
            String sanitizedTitle = title
                    .replaceAll("[^a-zA-Z0-9\\s-_]", "")
                    .replaceAll("\\s+", "_")
                    .trim()
                    .toLowerCase();

            if (sanitizedTitle.isEmpty()) {
                sanitizedTitle = "untitled_" + System.currentTimeMillis();
            }

            String extension = getFileExtension(file.getOriginalFilename());
            String filePath = String.format("%s/%s%s", artistId, sanitizedTitle, extension);

            logger.debug("File path: {}", filePath);

            uploadToSupabase(file, filePath);
            
            logger.info("✅ Song file saved successfully: {}", filePath);
            return filePath;

        } catch (IllegalArgumentException e) {
            logger.error("❌ Invalid argument while saving file: {}", e.getMessage());
            throw e;
        } catch (IOException e) {
            logger.error("❌ IO error while saving song file: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to store song file: " + e.getMessage(), e);
        } catch (RestClientException e) {
            logger.error("❌ Supabase API error: {}", e.getMessage(), e);
            throw new RuntimeException("Supabase upload failed: " + e.getMessage(), e);
        } catch (RuntimeException e) {
            logger.error("❌ Unexpected runtime error: {}", e.getMessage(), e);
            throw new RuntimeException("Unexpected error: " + e.getMessage(), e);
        }
    }

    private String getFileExtension(String originalFilename) {
        if (originalFilename != null && originalFilename.contains(".")) {
            return originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        logger.debug("No file extension found, using default: .mp3");
        return ".mp3";
    }

    private void uploadToSupabase(MultipartFile file, String filePath) throws IOException {
        String uploadUrl = supabaseUrl + "/storage/v1/object/" + BUCKET_NAME + "/" + filePath;
        logger.debug("Uploading to Supabase URL: {}", uploadUrl);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.set("Authorization", "Bearer " + supabaseServiceRoleKey);
        headers.set("apikey", supabaseServiceRoleKey);

        ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", fileResource);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(uploadUrl, requestEntity, String.class);
            
            if (!response.getStatusCode().is2xxSuccessful()) {
                logger.error("Supabase returned non-success status: {}", response.getStatusCode());
                throw new RuntimeException("Supabase upload failed: " + response.getBody());
            }
            
            logger.debug("Upload successful, status: {}", response.getStatusCode());
        } catch (RestClientException e) {
            logger.error("RestClient error during upload: {}", e.getMessage(), e);
            throw new IOException("Failed to upload to Supabase: " + e.getMessage(), e);
        }
    }

    // ==================== LOAD FILE FROM SUPABASE ====================
    public Resource loadFileAsResource(String filePath) {
        logger.debug("Loading file as resource: {}", filePath);
        
        try {
            String publicUrl = getPublicUrl(filePath);
            logger.debug("Public URL: {}", publicUrl);
            return new UrlResource(publicUrl);
        } catch (MalformedURLException ex) {
            logger.error("❌ Malformed URL for file path: {}", filePath, ex);
            throw new RuntimeException("File not found: " + filePath, ex);
        }
    }

    public String getPublicUrl(String filePath) {
        return supabaseUrl.replace("/v1", "") + "/storage/v1/object/public/" + BUCKET_NAME + "/" + filePath;
    }

    // ==================== DELETE FILE FROM SUPABASE ====================
    public void deleteFile(String filePath) {
        logger.info("Deleting file: {}", filePath);
        
        try {
            if (filePath == null || filePath.isBlank()) {
                throw new IllegalArgumentException("File path cannot be empty");
            }

            if (!fileExists(filePath)) {
                logger.warn("File does not exist, skipping delete: {}", filePath);
                return;
            }

            String deleteUrl = supabaseUrl + "/storage/v1/object/" + BUCKET_NAME + "/" + filePath;
            logger.debug("Delete URL: {}", deleteUrl);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseServiceRoleKey);
            headers.set("apikey", supabaseServiceRoleKey);

            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                deleteUrl, 
                HttpMethod.DELETE, 
                entity, 
                String.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                logger.error("Supabase returned non-success status: {}", response.getStatusCode());
                throw new RuntimeException("Could not delete file: " + response.getBody());
            }

            logger.info("✅ File deleted successfully: {}", filePath);

        } catch (IllegalArgumentException e) {
            logger.error("❌ Invalid argument: {}", e.getMessage());
            throw e;
        } catch (RestClientException e) {
            logger.error("❌ Supabase API error while deleting: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete file from storage: " + e.getMessage(), e);
        } catch (RuntimeException e) {
            logger.error("❌ Unexpected error while deleting file: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete file: " + e.getMessage(), e);
        }
    }

    // ==================== SUPABASE UTILITY ====================
    public boolean fileExists(String filePath) {
        logger.debug("Checking if file exists: {}", filePath);
        
        try {
            String publicUrl = getPublicUrl(filePath);
            Resource resource = new UrlResource(publicUrl);
            boolean exists = resource.exists();
            logger.debug("File exists check result: {}", exists);
            return exists;
        } catch (MalformedURLException e) {
            logger.error("Malformed URL while checking file existence: {}", e.getMessage());
            return false;
        } catch (RuntimeException e) {
            logger.error("Error checking file existence: {}", e.getMessage());
            return false;
        }
    }
}
