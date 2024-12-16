package inxh.softi.webprojekt.detyrekursi.service;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import inxh.softi.webprojekt.detyrekursi.models.User;
import inxh.softi.webprojekt.detyrekursi.models.Role;
import inxh.softi.webprojekt.detyrekursi.models.UserRegistrationDto;
import inxh.softi.webprojekt.detyrekursi.repository.UserRepository;

@Service
public class UserServiceImpl implements UserService{

    private UserRepository userRepository;
    
    
    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    @Override
    public User save(UserRegistrationDto registrationDto) {
        User user = new User(registrationDto.getFirstName(),
                registrationDto.getLastName(), registrationDto.getUsername(),
                registrationDto.getEmail(), registrationDto.getPassword(),
                Arrays.asList(new Role("ROLE_USER")));
        
        return userRepository.save(user);
    }
}
