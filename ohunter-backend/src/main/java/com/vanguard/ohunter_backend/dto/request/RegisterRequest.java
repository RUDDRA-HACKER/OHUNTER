package com.vanguard.ohunter_backend.dto.request;

import com.vanguard.ohunter_backend.enums.role;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    private String fullName;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{6,}$",
            message = "Password must be at least 6 characters and include uppercase, lowercase, number, and symbol")
        private String password;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be exactly 10 digits")
    private String phone;

    private String city;

    private String skills;

    private Integer experienceYears;

    @NotNull(message = "Role is required")
    private role role;
}