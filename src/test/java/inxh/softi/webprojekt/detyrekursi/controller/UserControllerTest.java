package inxh.softi.webprojekt.detyrekursi.controller;

import inxh.softi.webprojekt.detyrekursi.controllers.UserController;
import inxh.softi.webprojekt.detyrekursi.entity.User;
import inxh.softi.webprojekt.detyrekursi.models.LoginRequest;
import inxh.softi.webprojekt.detyrekursi.models.UserResponseDTO;
import inxh.softi.webprojekt.detyrekursi.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import jakarta.servlet.http.HttpSession;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserControllerTest {

    @Mock
    private UserService userService;
    @Mock
    private HttpSession session;
    @InjectMocks
    private UserController userController;
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testLogin_Successful() {
        LoginRequest loginRequest = new LoginRequest("user@gmail.com", "password");
        User user = new User();
        user.setRole("USER");
        user.setEmail("user@gmail.com");

        when(userService.authenticateUser(loginRequest.getIdentifier(), loginRequest.getPassword())).thenReturn(true);
        when(userService.getUserProfile(loginRequest.getIdentifier())).thenReturn(user);

        ResponseEntity<Map<String, Object>> response = userController.login(loginRequest);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals("Login successful", response.getBody().get("message"));
        assertEquals("USER", response.getBody().get("role"));
        assertEquals("user@gmail.com", response.getBody().get("email"));

        verify(session).setAttribute("username", "user@gmail.com");
        verify(session).setAttribute("role", "USER");
        verify(session).setAttribute("email", "user@gmail.com");
    }

    @Test
    void testLogin_Unsuccessful() {
        LoginRequest loginRequest = new LoginRequest("user@gmail.com", "wrongpassword");

        when(userService.authenticateUser(loginRequest.getIdentifier(), loginRequest.getPassword())).thenReturn(false);

        ResponseEntity<Map<String, Object>> response = userController.login(loginRequest);

        assertEquals(401, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals("Invalid username or password", response.getBody().get("message"));

        verifyNoInteractions(session);
    }

    @Test
    void testCreateUser() {
        User user = new User();
        user.setEmail("newuser@gmail.com");
        UserResponseDTO createdUser = new UserResponseDTO();
        createdUser.setId(1L);

        when(userService.createUser(user)).thenReturn(createdUser);

        ResponseEntity<UserResponseDTO> response = userController.createUser(user);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(1L, response.getBody().getId());
    }

    @Test
    void testGetUserById_Found() {
        UserResponseDTO userResponse = new UserResponseDTO();
        userResponse.setId(1L);

        when(userService.getUserById(1L)).thenReturn(userResponse);

        ResponseEntity<UserResponseDTO> response = userController.getUserById(1L);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(1L, response.getBody().getId());
    }

    @Test
    void testGetUserById_NotFound() {
        when(userService.getUserById(999L)).thenThrow(new IllegalArgumentException());

        ResponseEntity<UserResponseDTO> response = userController.getUserById(999L);

        assertEquals(404, response.getStatusCodeValue());
        assertNull(response.getBody());
    }

    @Test
    void testGetAllUsers() {
        UserResponseDTO user1 = new UserResponseDTO();
        UserResponseDTO user2 = new UserResponseDTO();
        when(userService.getAllUsers()).thenReturn(List.of(user1, user2));

        ResponseEntity<List<UserResponseDTO>> response = userController.getAllUsers();

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
    }

    @Test
    void testUpdateUser_Successful() {
        User userDetails = new User();
        UserResponseDTO updatedUser = new UserResponseDTO();
        updatedUser.setId(1L);

        when(userService.updateUser(1L, userDetails)).thenReturn(updatedUser);

        ResponseEntity<UserResponseDTO> response = userController.updateUser(1L, userDetails);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(1L, response.getBody().getId());
    }

    @Test
    void testUpdateUser_Unsuccessful() {
        User userDetails = new User();

        when(userService.updateUser(999L, userDetails)).thenThrow(new IllegalArgumentException());

        ResponseEntity<UserResponseDTO> response = userController.updateUser(999L, userDetails);

        assertEquals(400, response.getStatusCodeValue());
        assertNull(response.getBody());
    }

    @Test
    void testDeleteUser_Successful() {
        doNothing().when(userService).deleteUser(1L);

        ResponseEntity<String> response = userController.deleteUser(1L);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("User deleted successfully.", response.getBody());
    }

    @Test
    void testDeleteUser_Unsuccessful() {
        doThrow(new IllegalArgumentException("User not found")).when(userService).deleteUser(999L);

        ResponseEntity<String> response = userController.deleteUser(999L);

        assertEquals(400, response.getStatusCodeValue());
        assertEquals("User not found", response.getBody());
    }
}
