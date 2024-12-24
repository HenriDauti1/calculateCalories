package inxh.softi.webprojekt.detyrekursi.impl;

import inxh.softi.webprojekt.detyrekursi.entity.CaloriesData;
import inxh.softi.webprojekt.detyrekursi.exception.CaloriesDataNotFoundException;
import inxh.softi.webprojekt.detyrekursi.repository.CaloriesDataRepository;
import inxh.softi.webprojekt.detyrekursi.service.CaloriesDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CaloriesDataServiceImpl implements CaloriesDataService {

    private final CaloriesDataRepository caloriesDataRepository;

    public CaloriesDataServiceImpl(CaloriesDataRepository caloriesDataRepository) {
        this.caloriesDataRepository = caloriesDataRepository;
    }

    @Override
    public CaloriesData saveCaloriesData(CaloriesData caloriesData) {
        return caloriesDataRepository.save(caloriesData);
    }

    @Override
    public List<CaloriesData> getCaloriesDataByUsername(String username) {
        return caloriesDataRepository.findByUsername(username);
    }

    @Override
    public Optional<CaloriesData> getCaloriesDataById(Long id) {
        return caloriesDataRepository.findById(id);
    }

    @Override
    public void deleteCaloriesDataById(Long id) {
        caloriesDataRepository.deleteById(id);
    }

    @Override
    public CaloriesData updateCaloriesData(Long id, CaloriesData caloriesData) {
        Optional<CaloriesData> existingCaloriesData = caloriesDataRepository.findById(id);
        
        if (existingCaloriesData.isEmpty()) {
            throw new CaloriesDataNotFoundException(id);
        }

        caloriesData.setId(id);
        return caloriesDataRepository.save(caloriesData);
    }
}
