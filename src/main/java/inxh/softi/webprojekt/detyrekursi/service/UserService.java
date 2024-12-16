package inxh.softi.webprojekt.detyrekursi.service;

import inxh.softi.webprojekt.detyrekursi.models.User;
import inxh.softi.webprojekt.detyrekursi.models.UserRegistrationDto;

public interface UserService {
    User save(UserRegistrationDto registrationDto);
}
