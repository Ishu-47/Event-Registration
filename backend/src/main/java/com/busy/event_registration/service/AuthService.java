package com.busy.event_registration.service;

import java.time.LocalDateTime;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.busy.event_registration.dto.LoginRequest;
import com.busy.event_registration.dto.LoginResponse;
import com.busy.event_registration.dto.RegisterRequest;
import com.busy.event_registration.entity.Role;
import com.busy.event_registration.entity.User;
import com.busy.event_registration.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request){
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if(!passwordEncoder.matches(request.getPassword(), user.getPassword())){
            throw new BadCredentialsException("Invalid email or password");
        }

        return createLoginResponse(user);
    }
    public LoginResponse register(RegisterRequest request){
        if(userRepository.existsByEmail(request.getEmail())){
            throw new IllegalArgumentException("An account with this email already exists");
        }
        User user = User.builder().name(request.getName())
                                  .email(request.getEmail())
                                  .password(passwordEncoder.encode(request.getPassword()))
                                  .role(Role.CHECK_IN_STAFF)
                                  .createdAt(LocalDateTime.now())
                                  .build();
        userRepository.save(user);
        return createLoginResponse(user);
    }
    public LoginResponse createLoginResponse(User user){
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return new LoginResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }
    
}
