package com.vanguard.ohunter_backend.model;
import com.vanguard.ohunter_backend.enums.ApplicationStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "applications"})
    private User user;

    @ManyToOne
    @JoinColumn(name = "job_id", nullable = false)
    @JsonIgnoreProperties({"applications"})
    private Job job;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;  // APPLIED, SHORTLISTED etc.

    @Column(length = 1000)
    private String coverLetter;

    private String resumeUrl;          // resume at time of applying

    private LocalDateTime appliedAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        appliedAt   = LocalDateTime.now();
        updatedAt   = LocalDateTime.now();
        status      = ApplicationStatus.APPLIED;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

}
