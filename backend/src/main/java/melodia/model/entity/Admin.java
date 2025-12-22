package melodia.model.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/**
 * Entity untuk akun admin di Melodia.
 * Admin digunakan untuk mengelola platform (moderasi dan manajemen konten),
 * sementara logika bisnisnya berada di service/controller.
 */
@Entity
@DiscriminatorValue("ADMIN")
public class Admin extends Account {

    // * Diperlukan JPA saat memuat admin dari database.
    public Admin() {
        super();
    }

    // * Dipakai ketika membuat akun admin baru dari kode (seeding / panel admin).
    public Admin(String username, String email, String password) {
        super(username, email, password);
    }

    @Override
    public String getAccountType() {
        // * Harus konsisten dengan @DiscriminatorValue("ADMIN").
        return "ADMIN";
    }
}
