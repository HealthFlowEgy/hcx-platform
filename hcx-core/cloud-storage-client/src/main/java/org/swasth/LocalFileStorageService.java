package org.swasth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Local file storage service implementation
 * Replaces AWS S3 dependency with local file system storage
 */
@Service
public class LocalFileStorageService implements ICloudService {

    private static final Logger logger = LoggerFactory.getLogger(LocalFileStorageService.class);

    @Value("${local.storage.base.path:/var/hcx/storage}")
    private String baseStoragePath;

    @Value("${local.storage.public.url:http://localhost:8080/files}")
    private String publicBaseUrl;

    @Value("${local.storage.max.file.size:10485760}") // 10MB default
    private long maxFileSize;

    /**
     * Store file content in local storage
     * @param folderName Folder/directory name
     * @param bucketName Bucket name (used as top-level directory)
     */
    @Override
    public void putObject(String bucketName, String folderName) {
        try {
            Path directoryPath = createDirectoryPath(bucketName, folderName);
            Files.createDirectories(directoryPath);
            logger.info("Created directory: {}", directoryPath);
        } catch (IOException e) {
            logger.error("Error creating directory {}/{}: {}", bucketName, folderName, e.getMessage());
            throw new RuntimeException("Failed to create directory", e);
        }
    }

    /**
     * Store file content in local storage
     * @param bucketName Bucket name (used as top-level directory)
     * @param folderName Folder/file name
     * @param content File content as string
     */
    @Override
    public void putObject(String bucketName, String folderName, String content) {
        try {
            // Validate file size
            if (content.getBytes().length > maxFileSize) {
                throw new RuntimeException("File size exceeds maximum allowed size: " + maxFileSize);
            }

            Path filePath = createFilePath(bucketName, folderName);
            
            // Create parent directories if they don't exist
            Files.createDirectories(filePath.getParent());
            
            // Write content to file
            Files.write(filePath, content.getBytes());
            
            logger.info("File stored successfully: {}", filePath);
            
        } catch (IOException e) {
            logger.error("Error storing file {}/{}: {}", bucketName, folderName, e.getMessage());
            throw new RuntimeException("Failed to store file", e);
        }
    }

    /**
     * Store binary file content
     * @param bucketName Bucket name
     * @param fileName File name
     * @param inputStream Input stream with file content
     * @return Stored file path
     */
    public String putObject(String bucketName, String fileName, InputStream inputStream) {
        try {
            Path filePath = createFilePath(bucketName, fileName);
            
            // Create parent directories if they don't exist
            Files.createDirectories(filePath.getParent());
            
            // Copy input stream to file
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
            
            logger.info("Binary file stored successfully: {}", filePath);
            return filePath.toString();
            
        } catch (IOException e) {
            logger.error("Error storing binary file {}/{}: {}", bucketName, fileName, e.getMessage());
            throw new RuntimeException("Failed to store binary file", e);
        }
    }

    /**
     * Get public URL for accessing stored file
     * @param bucketName Bucket name
     * @param path File path
     * @return Public URL for file access
     */
    @Override
    public URL getUrl(String bucketName, String path) {
        try {
            String urlPath = String.format("%s/%s/%s", publicBaseUrl, bucketName, path);
            return new URL(urlPath);
        } catch (MalformedURLException e) {
            logger.error("Error creating URL for {}/{}: {}", bucketName, path, e.getMessage());
            throw new RuntimeException("Failed to create file URL", e);
        }
    }

    /**
     * Get file content as string
     * @param bucketName Bucket name
     * @param fileName File name
     * @return File content
     */
    public String getFileContent(String bucketName, String fileName) {
        try {
            Path filePath = createFilePath(bucketName, fileName);
            
            if (!Files.exists(filePath)) {
                throw new RuntimeException("File not found: " + filePath);
            }
            
            return Files.readString(filePath);
            
        } catch (IOException e) {
            logger.error("Error reading file {}/{}: {}", bucketName, fileName, e.getMessage());
            throw new RuntimeException("Failed to read file", e);
        }
    }

    /**
     * Get file as input stream
     * @param bucketName Bucket name
     * @param fileName File name
     * @return File input stream
     */
    public InputStream getFileStream(String bucketName, String fileName) {
        try {
            Path filePath = createFilePath(bucketName, fileName);
            
            if (!Files.exists(filePath)) {
                throw new RuntimeException("File not found: " + filePath);
            }
            
            return Files.newInputStream(filePath);
            
        } catch (IOException e) {
            logger.error("Error opening file stream {}/{}: {}", bucketName, fileName, e.getMessage());
            throw new RuntimeException("Failed to open file stream", e);
        }
    }

    /**
     * Delete file from storage
     * @param bucketName Bucket name
     * @param fileName File name
     * @return true if deleted successfully
     */
    public boolean deleteFile(String bucketName, String fileName) {
        try {
            Path filePath = createFilePath(bucketName, fileName);
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                logger.info("File deleted successfully: {}", filePath);
                return true;
            } else {
                logger.warn("File not found for deletion: {}", filePath);
                return false;
            }
            
        } catch (IOException e) {
            logger.error("Error deleting file {}/{}: {}", bucketName, fileName, e.getMessage());
            return false;
        }
    }

    /**
     * Check if file exists
     * @param bucketName Bucket name
     * @param fileName File name
     * @return true if file exists
     */
    public boolean fileExists(String bucketName, String fileName) {
        Path filePath = createFilePath(bucketName, fileName);
        return Files.exists(filePath);
    }

    /**
     * Get file size
     * @param bucketName Bucket name
     * @param fileName File name
     * @return File size in bytes
     */
    public long getFileSize(String bucketName, String fileName) {
        try {
            Path filePath = createFilePath(bucketName, fileName);
            
            if (!Files.exists(filePath)) {
                return -1;
            }
            
            return Files.size(filePath);
            
        } catch (IOException e) {
            logger.error("Error getting file size {}/{}: {}", bucketName, fileName, e.getMessage());
            return -1;
        }
    }

    /**
     * Generate unique file name with timestamp
     * @param originalFileName Original file name
     * @return Unique file name
     */
    public String generateUniqueFileName(String originalFileName) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        
        String extension = "";
        int lastDotIndex = originalFileName.lastIndexOf('.');
        if (lastDotIndex > 0) {
            extension = originalFileName.substring(lastDotIndex);
            originalFileName = originalFileName.substring(0, lastDotIndex);
        }
        
        return String.format("%s_%s_%s%s", originalFileName, timestamp, uuid, extension);
    }

    /**
     * Initialize storage directories
     */
    public void initializeStorage() {
        try {
            Path basePath = Paths.get(baseStoragePath);
            Files.createDirectories(basePath);
            
            // Create common directories
            Files.createDirectories(basePath.resolve("documents"));
            Files.createDirectories(basePath.resolve("certificates"));
            Files.createDirectories(basePath.resolve("logs"));
            Files.createDirectories(basePath.resolve("temp"));
            Files.createDirectories(basePath.resolve("backups"));
            
            logger.info("Local storage initialized at: {}", basePath);
            
        } catch (IOException e) {
            logger.error("Error initializing storage: {}", e.getMessage());
            throw new RuntimeException("Failed to initialize storage", e);
        }
    }

    /**
     * Get storage statistics
     * @return Storage usage information
     */
    public StorageStats getStorageStats() {
        try {
            Path basePath = Paths.get(baseStoragePath);
            
            if (!Files.exists(basePath)) {
                return new StorageStats(0, 0, 0);
            }
            
            long totalSize = Files.walk(basePath)
                    .filter(Files::isRegularFile)
                    .mapToLong(path -> {
                        try {
                            return Files.size(path);
                        } catch (IOException e) {
                            return 0;
                        }
                    })
                    .sum();
            
            long fileCount = Files.walk(basePath)
                    .filter(Files::isRegularFile)
                    .count();
            
            long directoryCount = Files.walk(basePath)
                    .filter(Files::isDirectory)
                    .count();
            
            return new StorageStats(totalSize, fileCount, directoryCount);
            
        } catch (IOException e) {
            logger.error("Error getting storage stats: {}", e.getMessage());
            return new StorageStats(0, 0, 0);
        }
    }

    /**
     * Create directory path
     */
    private Path createDirectoryPath(String bucketName, String folderName) {
        return Paths.get(baseStoragePath, bucketName, folderName);
    }

    /**
     * Create file path
     */
    private Path createFilePath(String bucketName, String fileName) {
        return Paths.get(baseStoragePath, bucketName, fileName);
    }

    /**
     * Storage statistics class
     */
    public static class StorageStats {
        private final long totalSize;
        private final long fileCount;
        private final long directoryCount;

        public StorageStats(long totalSize, long fileCount, long directoryCount) {
            this.totalSize = totalSize;
            this.fileCount = fileCount;
            this.directoryCount = directoryCount;
        }

        public long getTotalSize() { return totalSize; }
        public long getFileCount() { return fileCount; }
        public long getDirectoryCount() { return directoryCount; }

        @Override
        public String toString() {
            return String.format("StorageStats{totalSize=%d bytes, fileCount=%d, directoryCount=%d}", 
                               totalSize, fileCount, directoryCount);
        }
    }
}

