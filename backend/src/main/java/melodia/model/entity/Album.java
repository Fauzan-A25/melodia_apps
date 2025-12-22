package melodia.model.entity;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

/**
 * Representasi satu album di Melodia.
 * Menyimpan judul, tahun rilis, artist pemilik, daftar lagu, dan genre yang terkait.
 */
@Entity
@Table(name = "albums")
public class Album {

    // ==================== Konstanta & util ====================

    //! Prefix khusus untuk ID album (membantu dibedakan dari entity lain ketika debug / logging).
    private static final String ID_PREFIX = "ALB";

    //* Random sederhana untuk menambah sedikit entropi pada ID.
    private static final Random RANDOM = new Random();

    // ==================== Identitas & informasi dasar ====================

    @Id
    @Column(name = "album_id", length = 50, nullable = false)
    private String albumId; 

    @Column(name = "title", nullable = false, length = 100)
    private String title;   

    @Column(name = "release_year", nullable = false)
    private int releaseYear; // * Tahun rilis album

    @Column(name = "cover_emoji", length = 10)
    private String coverEmoji; // * Emoji default untuk sampul album

    // ==================== Relasi dengan artist ====================

    // * Artist pemilik album ini (satu artist bisa punya banyak album).
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id", nullable = false, referencedColumnName = "artist_id")
    @JsonIgnore // * Hindari serialisasi langsung entity artist untuk mencegah lazy-loading issue / siklus.
    private Artist artist;

    // ==================== Relasi dengan genre ====================

    // * Genre yang melekat pada album (bisa lebih dari satu).
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "album_genres",
        joinColumns = @JoinColumn(name = "album_id"),
        inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    @JsonIgnore 
    private List<Genre> genres = new ArrayList<>();

    // ==================== Relasi dengan lagu ====================

    // * Lagu-lagu yang termasuk di dalam album ini.
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "album_songs",
        joinColumns = @JoinColumn(name = "album_id"),
        inverseJoinColumns = @JoinColumn(name = "song_id")
    )
    @JsonIgnore // * Menghindari payload besar & siklus; detail lagu diambil via endpoint/DTO lain.
    private List<Song> songs = new ArrayList<>();

    // ==================== Constructors ====================

    // * Dipakai saat membuat album baru dari kode (misalnya dari panel artist/admin).
    public Album(String title, Artist artist, int releaseYear) {
        this.title = title;
        this.artist = artist;
        this.releaseYear = releaseYear;
    }

    // * Diperlukan oleh JPA. Dibiarkan protected agar tidak dipakai sembarangan.
    protected Album() {}

    // ==================== Lifecycle events ====================

    @PrePersist
    protected void onCreate() {
        // * Generate ID custom: prefix + timestamp millis + 1 digit random.
        if (this.albumId == null) {
            long now = System.currentTimeMillis();   // waktu dalam milidetik sejak epoch
            int randomDigit = RANDOM.nextInt(10);    // angka 0..9
            this.albumId = ID_PREFIX + now + randomDigit; // contoh: ALB17664039600007
        }

        // * Set emoji default kalau belum diisi.
        if (this.coverEmoji == null) {
            this.coverEmoji = "💿";
        }
    }

    // ==================== Getters & setters ====================

    public String getAlbumId() { return albumId; }
    public void setAlbumId(String albumId) { this.albumId = albumId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Artist getArtist() { return artist; }
    public void setArtist(Artist artist) { this.artist = artist; }

    public int getReleaseYear() { return releaseYear; }
    public void setReleaseYear(int releaseYear) { this.releaseYear = releaseYear; }

    public List<Genre> getGenres() { return genres; }
    public void setGenres(List<Genre> genres) {
        // * Pastikan list tidak null agar aman dipakai di service / template.
        this.genres = (genres != null) ? genres : new ArrayList<>();
    }

    public List<Song> getSongs() { return songs; }
    public void setSongs(List<Song> songs) {
        // * Sama seperti genres: jaga supaya tidak pernah null.
        this.songs = (songs != null) ? songs : new ArrayList<>();
    }

    public String getCoverEmoji() { return coverEmoji; }
    public void setCoverEmoji(String coverEmoji) { this.coverEmoji = coverEmoji; }

    // ==================== Helper untuk koleksi ====================

    // * Menambahkan satu lagu ke album jika belum terdaftar.
    public void addSong(Song song) {
        if (song != null && !this.songs.contains(song)) {
            this.songs.add(song);
        }
    }

    // * Menghapus satu lagu dari album.
    public void removeSong(Song song) {
        if (song != null) {
            this.songs.remove(song);
        }
    }

    // * Mengembalikan jumlah total lagu di album (berguna untuk UI/statistik).
    public int getTotalSongs() {
        return this.songs.size();
    }

    // ==================== Utility lain ====================

    // * Pencarian sederhana berdasarkan judul album.
    public boolean search(String keyword) {
        if (keyword == null || keyword.isEmpty()) {
            return false;
        }
        String text = keyword.toLowerCase();
        return this.title != null && this.title.toLowerCase().contains(text);
    }

    // ==================== Equality & debugging ====================

    @Override
    public boolean equals(Object o) {
        // * Dua album dianggap sama kalau punya ID yang sama.
        if (this == o) return true;
        if (!(o instanceof Album)) return false;
        Album other = (Album) o;
        return albumId != null && albumId.equals(other.getAlbumId());
    }

    @Override
    public int hashCode() {
        // * Pola yang umum dipakai untuk entity JPA.
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        // * Representasi ringkas untuk logging/debug tanpa menampilkan isi koleksi lengkap.
        return "Album{" +
                "albumId='" + albumId + '\'' +
                ", title='" + title + '\'' +
                ", artist=" + (artist != null ? artist.getArtistName() : "null") +
                ", releaseYear=" + releaseYear +
                ", totalSongs=" + songs.size() +
                ", totalGenres=" + genres.size() +
                '}';
    }
}
