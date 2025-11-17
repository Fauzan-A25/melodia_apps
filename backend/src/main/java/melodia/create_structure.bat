@echo off
echo ================================================
echo   Creating Melodia Backend Structure (Revised)
echo ================================================
echo.

REM ============================================
REM Create Main Entry Point
REM ============================================
echo [1/10] Creating main application file...
type nul > MelodiaApplication.java

REM ============================================
REM Create Config Directory
REM ============================================
echo [2/10] Creating config files...
mkdir config
type nul > config\SecurityConfig.java
type nul > config\CorsConfig.java
type nul > config\SwaggerConfig.java
type nul > config\FileStorageConfig.java

REM ============================================
REM Create Controller Directories
REM ============================================
echo [3/10] Creating controllers...
mkdir controller\user
mkdir controller\admin

REM User Controllers
type nul > controller\user\AuthController.java
type nul > controller\user\UserProfileController.java
type nul > controller\user\MusicController.java
type nul > controller\user\PlayerController.java
type nul > controller\user\LibraryController.java

REM Admin Controllers
type nul > controller\admin\AdminAuthController.java
type nul > controller\admin\AdminDashboardController.java
type nul > controller\admin\AdminUserController.java
type nul > controller\admin\AdminArtistController.java
type nul > controller\admin\AdminMusicController.java
type nul > controller\admin\AdminReportController.java

REM ============================================
REM Create Entity Directory
REM ============================================
echo [4/10] Creating entities...
mkdir entity
type nul > entity\Account.java
type nul > entity\User.java
type nul > entity\Artist.java
type nul > entity\Admin.java
type nul > entity\Song.java
type nul > entity\Album.java
type nul > entity\Playlist.java
type nul > entity\Library.java
type nul > entity\History.java
type nul > entity\Queue.java

REM ============================================
REM Create Repository Directory
REM ============================================
echo [5/10] Creating repositories...
mkdir repository
type nul > repository\AccountRepository.java
type nul > repository\UserRepository.java
type nul > repository\ArtistRepository.java
type nul > repository\AdminRepository.java
type nul > repository\SongRepository.java
type nul > repository\AlbumRepository.java
type nul > repository\PlaylistRepository.java
type nul > repository\LibraryRepository.java
type nul > repository\HistoryRepository.java

REM ============================================
REM Create Service Directories
REM ============================================
echo [6/10] Creating services...
mkdir service\auth
mkdir service\user
mkdir service\admin
mkdir service\music
mkdir service\strategy

REM Auth Services
type nul > service\auth\AuthenticationService.java
type nul > service\auth\RegistrationService.java

REM User Services
type nul > service\user\UserService.java
type nul > service\user\LibraryService.java
type nul > service\user\HistoryService.java
type nul > service\user\PlayerService.java

REM Admin Services
type nul > service\admin\AdminService.java
type nul > service\admin\UserManagementService.java
type nul > service\admin\ArtistManagementService.java
type nul > service\admin\ReportService.java

REM Music Services
type nul > service\music\MusicService.java
type nul > service\music\AlbumService.java
type nul > service\music\FileStorageService.java

REM Strategy Pattern
type nul > service\strategy\PlaybackStrategy.java
type nul > service\strategy\SequentialPlayback.java
type nul > service\strategy\ShufflePlayback.java
type nul > service\strategy\RepeatPlayback.java

REM ============================================
REM Create DTO Directories
REM ============================================
echo [7/10] Creating DTOs...
mkdir dto\request\auth
mkdir dto\request\user
mkdir dto\request\admin
mkdir dto\response

REM Request DTOs - Auth
type nul > dto\request\auth\LoginRequest.java
type nul > dto\request\auth\RegisterRequest.java
type nul > dto\request\auth\AdminLoginRequest.java

REM Request DTOs - User
type nul > dto\request\user\UpdateProfileRequest.java
type nul > dto\request\user\CreatePlaylistRequest.java
type nul > dto\request\user\PlayerActionRequest.java

REM Request DTOs - Admin
type nul > dto\request\admin\CreateArtistRequest.java
type nul > dto\request\admin\UploadSongRequest.java
type nul > dto\request\admin\CreateAlbumRequest.java
type nul > dto\request\admin\ManageUserRequest.java

REM Response DTOs
type nul > dto\response\AuthResponse.java
type nul > dto\response\UserResponse.java
type nul > dto\response\ArtistResponse.java
type nul > dto\response\AdminResponse.java
type nul > dto\response\SongResponse.java
type nul > dto\response\AlbumResponse.java
type nul > dto\response\PlaylistResponse.java
type nul > dto\response\PlayerStateResponse.java
type nul > dto\response\ErrorResponse.java

REM ============================================
REM Create Exception Directories
REM ============================================
echo [8/10] Creating exception handlers...
mkdir exception\auth
mkdir exception\user
mkdir exception\music
mkdir exception\admin
mkdir exception\common

REM Exception Handler
type nul > exception\GlobalExceptionHandler.java

REM Auth Exceptions
type nul > exception\auth\AuthenticationException.java
type nul > exception\auth\PasswordValidationException.java
type nul > exception\auth\UnauthorizedException.java

REM User Exceptions
type nul > exception\user\UserNotFoundException.java
type nul > exception\user\LibraryException.java

REM Music Exceptions
type nul > exception\music\SongNotFoundException.java
type nul > exception\music\PlaylistException.java
type nul > exception\music\AlbumException.java

REM Admin Exceptions
type nul > exception\admin\AdminAccessException.java
type nul > exception\admin\ManagementException.java

REM Common Exceptions
type nul > exception\common\ResourceNotFoundException.java
type nul > exception\common\BadRequestException.java
type nul > exception\common\FileStorageException.java
type nul > exception\common\ValidationException.java

REM ============================================
REM Create Util Directory
REM ============================================
echo [9/10] Creating utilities...
mkdir util
type nul > util\IDGenerator.java
type nul > util\PasswordUtil.java
type nul > util\ValidationUtil.java
type nul > util\FileUtil.java
type nul > util\JwtUtil.java

REM ============================================
REM Create Security Directory
REM ============================================
echo [10/10] Creating security components...
mkdir security
type nul > security\JwtAuthenticationFilter.java
type nul > security\CustomUserDetailsService.java
type nul > security\RoleEnum.java

REM ============================================
REM Create Interfaces Directory
REM ============================================
echo [Bonus] Creating interfaces...
mkdir interfaces
type nul > interfaces\Loginable.java
type nul > interfaces\Searchable.java
type nul > interfaces\Playable.java

echo.
echo ================================================
echo   Structure created successfully!
echo ================================================
echo.
echo Summary:
echo - Main Application: MelodiaApplication.java
echo - Controllers: user ^& admin (12 files)
echo - Entities: 10 files
echo - Repositories: 9 files
echo - Services: auth, user, admin, music, strategy (17 files)
echo - DTOs: request ^& response (17 files)
echo - Exceptions: 5 categories (18 files)
echo - Utilities: 5 files
echo - Security: 3 files
echo - Interfaces: 3 files
echo.
echo Total: 90+ files created!
echo.
pause
