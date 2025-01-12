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

}
