package inxh.softi.webprojekt.detyrekursi.service;

import inxh.softi.webprojekt.detyrekursi.entity.User;
import inxh.softi.webprojekt.detyrekursi.models.UserResponseDTO;

import java.util.List;


public interface UserService {
    UserResponseDTO createUser(User user);
    UserResponseDTO getUserById(Long id);
    List<UserResponseDTO> getAllUsers();
    UserResponseDTO updateUser(Long id, User userDetails);
    void deleteUser(Long id);
}
