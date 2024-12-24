package inxh.softi.webprojekt.detyrekursi.service;

import inxh.softi.webprojekt.detyrekursi.entity.CaloriesData;

import java.util.List;
import java.util.Optional;

public interface CaloriesDataService {
    CaloriesData saveCaloriesData(CaloriesData caloriesData);

    List<CaloriesData> getCaloriesDataByUsername(String username);

    Optional<CaloriesData> getCaloriesDataById(Long id);

    void deleteCaloriesDataById(Long id);

    CaloriesData updateCaloriesData(Long id, CaloriesData caloriesData);
}
