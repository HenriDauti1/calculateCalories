package inxh.softi.webprojekt.detyrekursi.controller;

import inxh.softi.webprojekt.detyrekursi.controllers.PageController;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.ui.Model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class PageControllerTest {

    private PageController pageController;

    @Mock
    private HttpSession session;

    @Mock
    private Model model;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        pageController = new PageController(session);
    }
    @Test
    void shouldReturnLoginPage() {
        String result = pageController.login();
        assertEquals("login", result, "Expected to return 'login' view");
    }
    @Test
    void shouldRedirectToUserPageForUserRoleAccessingAdmin() {
        when(session.getAttribute("role")).thenReturn("ROLE_USER");

        String result = pageController.admin(model);

        assertEquals("redirect:/user", result, "Expected to redirect to 'user' view for ROLE_USER accessing admin");
    }
    @Test
    void shouldReturnUserPageForUserRole() {
        when(session.getAttribute("role")).thenReturn("ROLE_USER");
        when(session.getAttribute("username")).thenReturn("normalUser");

        String result = pageController.user(model);

        verify(model).addAttribute("username", "normalUser");
        verify(model).addAttribute("role", "ROLE_USER");
        assertEquals("user", result, "Expected to return 'user' view for ROLE_USER");
    }
    @Test
    void shouldRedirectToLoginPageForNoRoleAccessingUser() {
        when(session.getAttribute("role")).thenReturn(null);

        String result = pageController.user(model);

        assertEquals("redirect:/login", result, "Expected to redirect to 'login' view for no role accessing user");
    }
}