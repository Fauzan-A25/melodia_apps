@echo off
echo Creating project structure with CSS modules...

:: Create main directories
mkdir src\components 2>nul
mkdir src\pages 2>nul
mkdir src\context 2>nul
mkdir src\services 2>nul
mkdir src\utils 2>nul
mkdir src\hooks 2>nul
mkdir src\styles 2>nul

:: Create component subdirectories
mkdir src\components\Auth 2>nul
mkdir src\components\Layout 2>nul
mkdir src\components\Music 2>nul
mkdir src\components\Common 2>nul

:: ====================================
:: AUTH COMPONENTS with CSS
:: ====================================
echo. > src\components\Auth\Login.jsx
echo. > src\components\Auth\Login.module.css

echo. > src\components\Auth\Register.jsx
echo. > src\components\Auth\Register.module.css

echo. > src\components\Auth\AuthForm.jsx
echo. > src\components\Auth\AuthForm.module.css

:: ====================================
:: LAYOUT COMPONENTS with CSS
:: ====================================
echo. > src\components\Layout\Sidebar.jsx
echo. > src\components\Layout\Sidebar.module.css

echo. > src\components\Layout\Topbar.jsx
echo. > src\components\Layout\Topbar.module.css

echo. > src\components\Layout\PlayerBar.jsx
echo. > src\components\Layout\PlayerBar.module.css

echo. > src\components\Layout\MainLayout.jsx
echo. > src\components\Layout\MainLayout.module.css

:: ====================================
:: MUSIC COMPONENTS with CSS
:: ====================================
echo. > src\components\Music\AlbumCard.jsx
echo. > src\components\Music\AlbumCard.module.css

echo. > src\components\Music\TrackList.jsx
echo. > src\components\Music\TrackList.module.css

echo. > src\components\Music\TrackItem.jsx
echo. > src\components\Music\TrackItem.module.css

echo. > src\components\Music\PlaylistCard.jsx
echo. > src\components\Music\PlaylistCard.module.css

:: ====================================
:: COMMON COMPONENTS with CSS
:: ====================================
echo. > src\components\Common\Button.jsx
echo. > src\components\Common\Button.module.css

echo. > src\components\Common\SearchInput.jsx
echo. > src\components\Common\SearchInput.module.css

echo. > src\components\Common\Card.jsx
echo. > src\components\Common\Card.module.css

:: ====================================
:: PAGE COMPONENTS with CSS
:: ====================================
echo. > src\pages\Home.jsx
echo. > src\pages\Home.module.css

echo. > src\pages\Library.jsx
echo. > src\pages\Library.module.css

echo. > src\pages\Playlist.jsx
echo. > src\pages\Playlist.module.css

echo. > src\pages\History.jsx
echo. > src\pages\History.module.css

echo. > src\pages\Search.jsx
echo. > src\pages\Search.module.css

echo. > src\pages\AuthPage.jsx
echo. > src\pages\AuthPage.module.css

:: ====================================
:: CONTEXT FILES
:: ====================================
echo. > src\context\AuthContext.jsx
echo. > src\context\PlayerContext.jsx
echo. > src\context\MusicContext.jsx

:: ====================================
:: SERVICE FILES
:: ====================================
echo. > src\services\api.js
echo. > src\services\authService.js
echo. > src\services\musicService.js

:: ====================================
:: UTILITY FILES
:: ====================================
echo. > src\utils\formatTime.js
echo. > src\utils\constants.js

:: ====================================
:: HOOK FILES
:: ====================================
echo. > src\hooks\useAuth.js
echo. > src\hooks\usePlayer.js

:: ====================================
:: GLOBAL STYLE FILES
:: ====================================
echo. > src\styles\global.css
echo. > src\styles\variables.css
echo. > src\styles\reset.css

echo Folder structure with CSS modules created successfully!
