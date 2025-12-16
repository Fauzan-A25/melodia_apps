package melodia.model.service.admin;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import melodia.model.dto.response.UserManagementResponse;
import melodia.model.entity.Account;
import melodia.model.entity.User;
import melodia.model.repository.AccountRepository;

@Service
public class UserManagementService {

    private static final Logger logger = LoggerFactory.getLogger(UserManagementService.class);

    @Autowired
    private AccountRepository accountRepository;

    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    // ==================== GET USERS ====================

    /**
     * Get all users (excludes Admin accounts)
     */
    public List<UserManagementResponse> getAllUsers() {
        logger.debug("Fetching all users (excluding admins)");
        List<UserManagementResponse> users = accountRepository.findAll().stream()
                .filter(acc -> !(acc instanceof melodia.model.entity.Admin))
                .map(this::mapAccountToResponse)
                .collect(Collectors.toList());
        
        logger.info("Found {} users", users.size());
        return users;
    }

    /**
     * Get users by type (USER only, since Artist is no longer an Account)
     */
    public List<UserManagementResponse> getUsersByType(String type) {
        logger.debug("Fetching users by type: {}", type);
        
        if (!"USER".equalsIgnoreCase(type)) {
            logger.warn("Invalid user type requested: {}. Only 'USER' is supported.", type);
            return List.of();
        }

        List<UserManagementResponse> users = accountRepository.findAll().stream()
                .filter(acc -> acc instanceof User && !(acc instanceof melodia.model.entity.Admin))
                .map(this::mapAccountToResponse)
                .collect(Collectors.toList());
        
        logger.info("Found {} users of type: USER", users.size());
        return users;
    }

    /**
     * Get banned users
     */
    public List<UserManagementResponse> getBannedUsers() {
        logger.debug("Fetching banned users");
        List<UserManagementResponse> users = accountRepository.findAll().stream()
                .filter(acc -> acc.isBanned() && !(acc instanceof melodia.model.entity.Admin))
                .map(this::mapAccountToResponse)
                .collect(Collectors.toList());
        
        logger.info("Found {} banned users", users.size());
        return users;
    }

    /**
     * Search users by username or email
     */
    public List<UserManagementResponse> searchUsers(String keyword) {
        logger.debug("Searching users with keyword: {}", keyword);
        String q = keyword == null ? "" : keyword.trim();
        
        if (q.isEmpty()) {
            return getAllUsers();
        }
        
        String lower = q.toLowerCase();

        List<UserManagementResponse> users = accountRepository.findAll().stream()
                .filter(acc -> !(acc instanceof melodia.model.entity.Admin))
                .filter(acc ->
                        acc.getUsername().toLowerCase().contains(lower) ||
                        acc.getEmail().toLowerCase().contains(lower)
                )
                .map(this::mapAccountToResponse)
                .collect(Collectors.toList());
        
        logger.info("Found {} users matching keyword: {}", users.size(), keyword);
        return users;
    }

    // ==================== BAN / UNBAN / DELETE ====================

    public void banUser(String accountId, String reason) {
        logger.info("Banning user with accountId: {}", accountId);
        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        acc.setBanned(true);
        acc.setBanReason(reason);
        accountRepository.save(acc);
        
        logger.info("User banned successfully: {} (reason: {})", acc.getUsername(), reason);
    }

    public void unbanUser(String accountId) {
        logger.info("Unbanning user with accountId: {}", accountId);
        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        acc.setBanned(false);
        acc.setBanReason(null);
        accountRepository.save(acc);
        
        logger.info("User unbanned successfully: {}", acc.getUsername());
    }

    public void deleteUser(String accountId) {
        logger.info("Deleting user with accountId: {}", accountId);
        if (!accountRepository.existsById(accountId)) {
            throw new IllegalArgumentException("Account not found");
        }
        accountRepository.deleteById(accountId);
        logger.info("User deleted successfully");
    }

    // ==================== MAPPER ====================

    /**
     * Map Account entity to UserManagementResponse DTO.
     * Since Artist is no longer an Account, we only handle User type.
     */
    private UserManagementResponse mapAccountToResponse(Account account) {
        String accountType = account instanceof User ? "USER" : account.getAccountType();

        return new UserManagementResponse(
                account.getAccountId(),
                account.getUsername(),
                account.getEmail(),
                accountType,
                account.isBanned(),
                account.getBanReason(),
                account.getCreatedAt() != null
                        ? account.getCreatedAt().format(DATE_TIME_FORMATTER)
                        : null
        );
    }
}
