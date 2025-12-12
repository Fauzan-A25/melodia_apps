package melodia.model.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import melodia.model.entity.History;

@Repository
public interface HistoryRepository extends JpaRepository<History, String> {

}
