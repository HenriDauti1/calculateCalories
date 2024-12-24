package inxh.softi.webprojekt.detyrekursi.repository;

import inxh.softi.webprojekt.detyrekursi.entity.CaloriesData;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CaloriesDataRepository extends JpaRepository<CaloriesData, Long> {
    List<CaloriesData> findByUsername(String username);
}
