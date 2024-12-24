package inxh.softi.webprojekt.detyrekursi.repository;

import inxh.softi.webprojekt.detyrekursi.entity.CaloriesData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface CaloriesDataRepository extends JpaRepository<CaloriesData, Long> {
    List<CaloriesData> findByUsername(String username);
    @Query("SELECT c FROM CaloriesData c WHERE c.username = :username AND c.dateTime BETWEEN :startOfWeek AND :endOfWeek")
    List<CaloriesData> findByUsernameAndDateRange(
            @Param("username") String username,
            @Param("startOfWeek") LocalDateTime startOfWeek,
            @Param("endOfWeek") LocalDateTime endOfWeek);
}
