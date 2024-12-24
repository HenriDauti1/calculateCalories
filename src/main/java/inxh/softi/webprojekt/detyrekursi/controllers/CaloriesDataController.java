package inxh.softi.webprojekt.detyrekursi.controllers;

import inxh.softi.webprojekt.detyrekursi.entity.CaloriesData;
import inxh.softi.webprojekt.detyrekursi.service.CaloriesDataService;
import inxh.softi.webprojekt.detyrekursi.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/calories")
public class CaloriesDataController {

    private final CaloriesDataService caloriesDataService;

    private final UserService userService;

    @Autowired
    public CaloriesDataController(CaloriesDataService caloriesDataService, UserService userService) {
        this.caloriesDataService = caloriesDataService;
        this.userService = userService;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addCaloriesData(@RequestBody CaloriesData caloriesData, @RequestParam String username) {
        if (!userService.doesUserExists(username)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("User with username " + username + " does not exist.");
        }
        caloriesData.setUsername(username);
        caloriesData.setDateTime(LocalDateTime.now());
        CaloriesData savedData = caloriesDataService.saveCaloriesData(caloriesData);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedData);
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<?> getCaloriesDataByUsername(@PathVariable String username) {
        if (!userService.doesUserExists(username)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("User with username " + username + " does not exist.");
        }
        List<CaloriesData> data = caloriesDataService.getCaloriesDataByUsername(username);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCaloriesDataById(@PathVariable Long id) {
        Optional<CaloriesData> data = caloriesDataService.getCaloriesDataById(id);

        if (data.isPresent()) {
            return ResponseEntity.ok(data.get());
        }

        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", "Food entry not found.");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateCaloriesData(@PathVariable Long id, @RequestBody CaloriesData caloriesData, @RequestParam String username) {
        if (!userService.doesUserExists(username)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("User with username " + username + " does not exist.");
        }

        CaloriesData existingData = caloriesDataService.getCaloriesDataById(id).orElse(null);
        if (existingData == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Food entry not found.");
        }

        caloriesData.setId(id);
        caloriesData.setUsername(username);
        caloriesData.setDateTime(LocalDateTime.now());
        CaloriesData updatedData = caloriesDataService.updateCaloriesData(id, caloriesData);
        return ResponseEntity.ok(updatedData);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteCaloriesData(@PathVariable Long id, @RequestParam String username) {
        if (!userService.doesUserExists(username)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("User with username " + username + " does not exist.");
        }
        CaloriesData existingData = caloriesDataService.getCaloriesDataById(id).orElse(null);
        if (existingData == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Food entry not found.");
        }

        caloriesDataService.deleteCaloriesDataById(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body("Food entry deleted successfully.");
    }
}
