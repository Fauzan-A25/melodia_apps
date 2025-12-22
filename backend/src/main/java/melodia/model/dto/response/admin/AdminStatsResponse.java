package melodia.model.dto.response.admin;

public class AdminStatsResponse {
    private final int totalUsers;
    private final int totalArtists;
    private final int totalGenres;
    private final int bannedAccounts;

    public AdminStatsResponse(int totalUsers, int totalArtists, int totalGenres, int bannedAccounts) {
        this.totalUsers = totalUsers;
        this.totalArtists = totalArtists;
        this.totalGenres = totalGenres;
        this.bannedAccounts = bannedAccounts;
    }

    // Getters
    public int getTotalUsers() {
        return totalUsers;
    }

    public int getTotalArtists() {
        return totalArtists;
    }

    public int getTotalGenres() {
        return totalGenres;
    }

    public int getBannedAccounts() {
        return bannedAccounts;
    }
}
