# melodia_apps
backend/
│
├── src/
│   └── main/
│       ├── java/
│       │   └── melodia/
│       │       ├── MelodiaApplication.java              # Main entry point
│       │       │
│       │       ├── config/                              # ⚙️ Configuration
│       │       │   ├── SecurityConfig.java              # Spring Security + role-based access
│       │       │   ├── CorsConfig.java                  # CORS untuk frontend & admin panel
│       │       │   ├── SwaggerConfig.java               # API documentation
│       │       │   └── FileStorageConfig.java           # File upload config
│       │       │
│       │       ├── controller/                          # 🌐 REST API Controllers
│       │       │   ├── user/                            # End-User Controllers (pendengar)
│       │       │   │   ├── AuthController.java          # Login/Register untuk User
│       │       │   │   ├── UserProfileController.java   # User profile management
│       │       │   │   ├── MusicController.java         # Song, Playlist, Album browsing
│       │       │   │   ├── PlayerController.java        # Music player + queue + playback
│       │       │   │   └── LibraryController.java       # User library & history
│       │       │   │
│       │       │   └── admin/                           # Admin Controllers (backend management)
│       │       │       ├── AdminAuthController.java     # Admin login
│       │       │       ├── AdminDashboardController.java # Stats & overview
│       │       │       ├── AdminUserController.java     # User management (CRUD, ban, etc)
│       │       │       ├── AdminArtistController.java   # Artist management
│       │       │       ├── AdminMusicController.java    # Song & Album management
│       │       │       └── AdminReportController.java   # Reports & analytics
│       │       │
│       │       ├── entity/                              # 🗂️ JPA Entities (Database Models)
│       │       │   ├── Account.java                     # Abstract base (username, email, password, role)
│       │       │   ├── User.java                        # End-user (extends Account)
│       │       │   ├── Artist.java                      # Artist (extends Account, managed by Admin)
│       │       │   ├── Admin.java                       # Admin (extends Account)
│       │       │   ├── Song.java                        # Song entity
│       │       │   ├── Album.java                       # Album entity
│       │       │   ├── Playlist.java                    # Playlist entity
│       │       │   ├── Library.java                     # User library
│       │       │   ├── History.java                     # Listening history
│       │       │   └── Queue.java                       # Player queue (part of PlayerState)
│       │       │
│       │       ├── repository/                          # 💾 Spring Data JPA Repositories
│       │       │   ├── AccountRepository.java           # Base account queries
│       │       │   ├── UserRepository.java              # User-specific queries
│       │       │   ├── ArtistRepository.java            # Artist queries
│       │       │   ├── AdminRepository.java             # Admin queries
│       │       │   ├── SongRepository.java              # Song CRUD & search
│       │       │   ├── AlbumRepository.java             # Album queries
│       │       │   ├── PlaylistRepository.java          # Playlist queries
│       │       │   ├── LibraryRepository.java           # Library queries
│       │       │   └── HistoryRepository.java           # History tracking
│       │       │
│       │       ├── service/                             # 🔧 Business Logic Services
│       │       │   ├── auth/                            # Authentication Services
│       │       │   │   ├── AuthenticationService.java   # Login/logout/token logic
│       │       │   │   └── RegistrationService.java     # User & Admin registration
│       │       │   │
│       │       │   ├── user/                            # End-User Services
│       │       │   │   ├── UserService.java             # User profile operations
│       │       │   │   ├── LibraryService.java          # Library management
│       │       │   │   ├── HistoryService.java          # History tracking
│       │       │   │   └── PlayerService.java           # Music player (Singleton) + Queue + Playback Strategy
│       │       │   │
│       │       │   ├── admin/                           # Admin Services
│       │       │   │   ├── AdminService.java            # Admin operations
│       │       │   │   ├── UserManagementService.java   # Manage users (ban, delete, etc)
│       │       │   │   ├── ArtistManagementService.java # Manage artists
│       │       │   │   └── ReportService.java           # Analytics & reports
│       │       │   │
│       │       │   ├── music/                           # Music Content Services
│       │       │   │   ├── MusicService.java            # Song & Playlist management (unified)
│       │       │   │   ├── AlbumService.java            # Album management (Admin-only)
│       │       │   │   └── FileStorageService.java      # File upload/storage
│       │       │   │
│       │       │   └── strategy/                        # 🎯 Strategy Pattern (Playback)
│       │       │       ├── PlaybackStrategy.java        # Interface
│       │       │       ├── SequentialPlayback.java      # Sequential strategy
│       │       │       ├── ShufflePlayback.java         # Shuffle strategy
│       │       │       └── RepeatPlayback.java          # Repeat strategy
│       │       │
│       │       ├── dto/                                 # 📦 Data Transfer Objects
│       │       │   ├── request/
│       │       │   │   ├── auth/
│       │       │   │   │   ├── LoginRequest.java
│       │       │   │   │   ├── RegisterRequest.java     # Unified registration
│       │       │   │   │   └── AdminLoginRequest.java
│       │       │   │   │
│       │       │   │   ├── user/
│       │       │   │   │   ├── UpdateProfileRequest.java
│       │       │   │   │   ├── CreatePlaylistRequest.java
│       │       │   │   │   └── PlayerActionRequest.java
│       │       │   │   │
│       │       │   │   └── admin/
│       │       │   │       ├── CreateArtistRequest.java
│       │       │   │       ├── UploadSongRequest.java
│       │       │   │       ├── CreateAlbumRequest.java
│       │       │   │       └── ManageUserRequest.java
│       │       │   │
│       │       │   └── response/
│       │       │       ├── AuthResponse.java            # With JWT token
│       │       │       ├── UserResponse.java
│       │       │       ├── ArtistResponse.java
│       │       │       ├── AdminResponse.java
│       │       │       ├── SongResponse.java
│       │       │       ├── AlbumResponse.java
│       │       │       ├── PlaylistResponse.java
│       │       │       ├── PlayerStateResponse.java
│       │       │       └── ErrorResponse.java           # Standard error format
│       │       │
│       │       ├── exception/                           # ❌ Custom Exceptions & Handlers
│       │       │   ├── GlobalExceptionHandler.java      # Centralized error handling
│       │       │   ├── auth/
│       │       │   │   ├── AuthenticationException.java # Login/token errors (try-catch)
│       │       │   │   ├── PasswordValidationException.java # Password errors (try-catch)
│       │       │   │   └── UnauthorizedException.java   # 401 errors
│       │       │   │
│       │       │   ├── user/
│       │       │   │   ├── UserNotFoundException.java
│       │       │   │   └── LibraryException.java
│       │       │   │
│       │       │   ├── music/
│       │       │   │   ├── SongNotFoundException.java
│       │       │   │   ├── PlaylistException.java
│       │       │   │   └── AlbumException.java
│       │       │   │
│       │       │   ├── admin/
│       │       │   │   ├── AdminAccessException.java
│       │       │   │   └── ManagementException.java
│       │       │   │
│       │       │   └── common/
│       │       │       ├── ResourceNotFoundException.java # Generic 404
│       │       │       ├── BadRequestException.java     # 400 errors
│       │       │       ├── FileStorageException.java    # File upload errors
│       │       │       └── ValidationException.java     # Input validation errors
│       │       │
│       │       ├── util/                                # 🔧 Utility Classes
│       │       │   ├── IDGenerator.java                 # UUID generator
│       │       │   ├── PasswordUtil.java                # BCrypt + validation (with try-catch)
│       │       │   ├── ValidationUtil.java              # Input validation (with try-catch)
│       │       │   ├── FileUtil.java                    # File handling helpers
│       │       │   └── JwtUtil.java                     # JWT token generation/validation
│       │       │
│       │       ├── security/                            # 🔐 Security Components
│       │       │   ├── JwtAuthenticationFilter.java     # JWT filter
│       │       │   ├── CustomUserDetailsService.java    # Load user for authentication
│       │       │   └── RoleEnum.java                    # USER, ARTIST, ADMIN roles
│       │       │
│       │       └── interfaces/                          # 🔌 Custom Interfaces
│       │           ├── Loginable.java                   # Login interface
│       │           ├── Searchable.java                  # Search interface
│       │           └── Playable.java                    # Playable interface
│       │
│       └── resources/
│           ├── application.properties                   # Main config
│           ├── application-dev.properties               # Dev environment
│           ├── application-prod.properties              # Production environment
│           ├── static/                                  # Static resources
│           │   └── uploads/                             # Uploaded songs/images
│           └── templates/                               # Email templates (optional)
│
├── Dockerfile                                           # Docker build config
├── .dockerignore                                        # Docker ignore file
├── docker-compose.yml                                   # Multi-container setup
├── pom.xml                                              # Maven dependencies
└── README.md                                            # Project documentation
