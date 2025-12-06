 import styles from './Library.module.css';
import { Heart, Music2, Play, Plus } from 'lucide-react';

const userLibrary = [
  {
    id: 1,
    title: 'Ocean Breeze',
    artist: 'Coastal Vibe',
    cover: '🌊',
    liked: true,
  },
  {
    id: 2,
    title: 'Starlight',
    artist: 'Cosmic Band',
    cover: '⭐',
    liked: false,
  },
  {
    id: 3,
    title: 'Summer Nights',
    artist: 'Beach Boys',
    cover: '🌅',
    liked: true,
  },
  {
    id: 4,
    title: 'Urban Jungle',
    artist: 'City Beats',
    cover: '🏙️',
    liked: false,
  },
];

const playlists = [
  {
    id: 1,
    name: 'My Favourites',
    icon: <Heart size={18} color="#3b82f6" />,
    count: 13,
    color: 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)',
  },
  {
    id: 2,
    name: 'Chill Vibes',
    icon: <Music2 size={18} color="#38bdf8" />,
    count: 9,
    color: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
  },
  {
    id: 3,
    name: 'Workout Mix',
    icon: <Music2 size={18} color="#8b5cf6" />,
    count: 6,
    color: 'linear-gradient(135deg, #6366f1 0%, #f472b6 100%)',
  },
];

const Library = () => {
  return (
    <div className={styles.libraryContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>🎶 My Library</h1>
        <button className={styles.createBtn}>
          <Plus size={16} />
          <span>Create Playlist</span>
        </button>
      </header>

      <section className={styles.playlistSection}>
        <h2 className={styles.sectionTitle}>Playlists</h2>
        <div className={styles.playlistGrid}>
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className={styles.playlistCard}
              style={{ background: playlist.color }}
            >
              <div className={styles.playlistIcon}>{playlist.icon}</div>
              <h3 className={styles.playlistName}>{playlist.name}</h3>
              <span className={styles.playlistCount}>{playlist.count} tracks</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.songSection}>
        <h2 className={styles.sectionTitle}>Songs</h2>
        <div className={styles.songGrid}>
          {userLibrary.map((track) => (
            <div key={track.id} className={styles.songCard}>
              <div className={styles.coverArea}>
                <div className={styles.cover}>{track.cover}</div>
                <button className={styles.songPlayBtn}>
                  <Play size={18} />
                </button>
                <button className={`${styles.likeBtn} ${track.liked ? styles.liked : ''}`}>
                  <Heart size={16} fill={track.liked ? "#3b82f6" : 'none'} />
                </button>
              </div>
              <div className={styles.songInfo}>
                <h4 className={styles.songTitle}>{track.title}</h4>
                <p className={styles.songArtist}>{track.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Library;
