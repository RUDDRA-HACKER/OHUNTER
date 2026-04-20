package com.vanguard.ohunter_backend.dto.response;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private Long userId;
    private String fullName;
    private String email;
    private String token;
    private String role;
    private String message;
}
