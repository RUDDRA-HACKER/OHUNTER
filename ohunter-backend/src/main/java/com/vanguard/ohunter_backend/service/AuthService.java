package com.vanguard.ohunter_backend.service;
import com.vanguard.ohunter_backend.dto.request.LoginRequest;
import com.vanguard.ohunter_backend.dto.request.RegisterRequest;
import com.vanguard.ohunter_backend.dto.response.AuthResponse;
import com.vanguard.ohunter_backend.exception.DuplicateEmailException;
import com.vanguard.ohunter_backend.exception.InvalidCredentialsException;
import com.vanguard.ohunter_backend.exception.ResourceNotFoundException;
import com.vanguard.ohunter_backend.model.User;
import com.vanguard.ohunter_backend.repository.UserRepository;
import com.vanguard.ohunter_backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // Register new user
    public AuthResponse register(RegisterRequest request) {

        // Check duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("Email already registered!");
        }

        // Build and save user
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .city(request.getCity())
                .skills(request.getSkills())
                .experienceYears(request.getExperienceYears())
                .role(request.getRole())
                .isVerified(false)
                .build();

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());

        return new AuthResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                token,
                user.getRole().name(),
                "Registration successful!"
        );
    }

    // Login user
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found!"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid password!");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        return new AuthResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                token,
                user.getRole().name(),
                "Login successful!"
        );
    }
}
