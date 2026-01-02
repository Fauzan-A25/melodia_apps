package melodia.model.dto.response.admin;

public class AdminStatsResponse {
    private int totalUsers;
    private int totalArtists;
    private int totalGenres;
    private int bannedAccounts;

    public AdminStatsResponse(int totalUsers, int totalArtists, int totalGenres, int bannedAccounts) {
        this.totalUsers = totalUsers;
        this.totalArtists = totalArtists;
        this.totalGenres = totalGenres;
        this.bannedAccounts = bannedAccounts;
    }

    // Getters
    public int getTotalUsers() { return totalUsers; }
    public int getTotalArtists() { return totalArtists; }
    public int getTotalGenres() { return totalGenres; }
    public int getBannedAccounts() { return bannedAccounts; }

    // Setters
    public void setTotalUsers(int totalUsers) { this.totalUsers = totalUsers; }
    public void setTotalArtists(int totalArtists) { this.totalArtists = totalArtists; }
    public void setTotalGenres(int totalGenres) { this.totalGenres = totalGenres; }
    public void setBannedAccounts(int bannedAccounts) { this.bannedAccounts = bannedAccounts; }
}
