package inxh.softi.webprojekt.detyrekursi.controller;

import inxh.softi.webprojekt.detyrekursi.controllers.CaloriesDataController;
import inxh.softi.webprojekt.detyrekursi.entity.CaloriesData;
import inxh.softi.webprojekt.detyrekursi.service.CaloriesDataService;
import inxh.softi.webprojekt.detyrekursi.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CaloriesDataControllerTest {

    @Mock
    private CaloriesDataService caloriesDataService;

    @Mock
    private UserService userService;

    @InjectMocks
    private CaloriesDataController caloriesDataController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testAddCaloriesData_Successful() {
        CaloriesData caloriesData = new CaloriesData();
        caloriesData.setId(1L);
        caloriesData.setCalories(500);
        String username = "testusername";

        when(userService.doesUserExists(username)).thenReturn(true);
        when(caloriesDataService.saveCaloriesData(any(CaloriesData.class))).thenReturn(caloriesData);

        ResponseEntity<?> response = caloriesDataController.addCaloriesData(caloriesData, username);

        assertEquals(201, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        verify(caloriesDataService).saveCaloriesData(any(CaloriesData.class));
    }

    @Test
    void testAddCaloriesData_UserDoesNotExist() {
        CaloriesData caloriesData = new CaloriesData();
        String username = "testUnknownUsername";

        when(userService.doesUserExists(username)).thenReturn(false);

        ResponseEntity<?> response = caloriesDataController.addCaloriesData(caloriesData, username);

        assertEquals(400, response.getStatusCodeValue());
        assertEquals("User with username testUnknownUsername does not exist.", response.getBody());
        verifyNoInteractions(caloriesDataService);
    }

    @Test
    void testGetCaloriesDataByUsername_Successful() {
        String username = "testusername";
        CaloriesData data1 = new CaloriesData();
        CaloriesData data2 = new CaloriesData();

        when(userService.doesUserExists(username)).thenReturn(true);
        when(caloriesDataService.getCaloriesDataByUsername(username)).thenReturn(List.of(data1, data2));

        ResponseEntity<?> response = caloriesDataController.getCaloriesDataByUsername(username);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(2, ((List<?>) response.getBody()).size());
    }

    @Test
    void testGetCaloriesDataByUsername_UserDoesNotExist() {
        String username = "testUnknownUsername";

        when(userService.doesUserExists(username)).thenReturn(false);

        ResponseEntity<?> response = caloriesDataController.getCaloriesDataByUsername(username);

        assertEquals(400, response.getStatusCodeValue());
        assertEquals("User with username testUnknownUsername does not exist.", response.getBody());
    }

    @Test
    void testGetCaloriesDataById_Found() {
        Long id = 1L;
        CaloriesData data = new CaloriesData();
        data.setId(id);

        when(caloriesDataService.getCaloriesDataById(id)).thenReturn(Optional.of(data));

        ResponseEntity<?> response = caloriesDataController.getCaloriesDataById(id);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(data, response.getBody());
    }

    @Test
    void testGetCaloriesDataById_NotFound() {
        Long id = 999L;

        when(caloriesDataService.getCaloriesDataById(id)).thenReturn(Optional.empty());

        ResponseEntity<?> response = caloriesDataController.getCaloriesDataById(id);

        assertEquals(404, response.getStatusCodeValue());
        assertEquals(Map.of("message", "Food entry not found."), response.getBody());
    }

    @Test
    void testDeleteCaloriesData_Successful() {
        Long id = 1L;
        String username = "testusername";

        when(userService.doesUserExists(username)).thenReturn(true);
        when(caloriesDataService.getCaloriesDataById(id)).thenReturn(Optional.of(new CaloriesData()));

        ResponseEntity<?> response = caloriesDataController.deleteCaloriesData(id, username);

        assertEquals(204, response.getStatusCodeValue());
        assertEquals("Food entry deleted successfully.", response.getBody());
        verify(caloriesDataService).deleteCaloriesDataById(id);
    }

    @Test
    void testDeleteCaloriesData_UserDoesNotExist() {
        Long id = 1L;
        String username = "testUnknownUsername";

        when(userService.doesUserExists(username)).thenReturn(false);

        ResponseEntity<?> response = caloriesDataController.deleteCaloriesData(id, username);

        assertEquals(400, response.getStatusCodeValue());
        assertEquals("User with username testUnknownUsername does not exist.", response.getBody());
    }

    @Test
    void testDeleteCaloriesData_NotFound() {
        Long id = 999L;
        String username = "testUsername";

        when(userService.doesUserExists(username)).thenReturn(true);
        when(caloriesDataService.getCaloriesDataById(id)).thenReturn(Optional.empty());

        ResponseEntity<?> response = caloriesDataController.deleteCaloriesData(id, username);

        assertEquals(404, response.getStatusCodeValue());
        assertEquals("Food entry not found.", response.getBody());
    }

    @Test
    void testGetDaysExceeding2500Calories_Successful() {
        String username = "testUsername";
        Map<LocalDate, Integer> exceedingDays = Map.of(LocalDate.now(), 3500);

        when(userService.doesUserExists(username)).thenReturn(true);
        when(caloriesDataService.getDaysExceeding2500Calories(username)).thenReturn(exceedingDays);

        ResponseEntity<?> response = caloriesDataController.getDaysExceeding2500(username);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(exceedingDays, response.getBody());
    }

    @Test
    void testGetDaysExceeding2500Calories_UserDoesNotExist() {
        String username = "testUnknownUsername";

        when(userService.doesUserExists(username)).thenReturn(false);

        ResponseEntity<?> response = caloriesDataController.getDaysExceeding2500(username);

        assertEquals(400, response.getStatusCodeValue());
        assertEquals("User with username testUnknownUsername does not exist.", response.getBody());
    }

}
