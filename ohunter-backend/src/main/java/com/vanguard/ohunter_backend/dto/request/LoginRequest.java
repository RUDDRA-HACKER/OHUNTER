package com.vanguard.ohunter_backend.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class LoginRequest {

        @Email(message = "Invalid email")
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

