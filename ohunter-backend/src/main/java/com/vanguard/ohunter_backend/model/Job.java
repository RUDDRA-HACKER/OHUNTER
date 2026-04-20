package com.vanguard.ohunter_backend.model;
import com.vanguard.ohunter_backend.enums.JobType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "jobs")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;              // "Backend Developer"

    @Column(length = 2000)
    private String description;

    private String location;           // "Bhubaneswar" or "Remote"

    @Enumerated(EnumType.STRING)
    private JobType jobType;           // FULL_TIME, PART_TIME etc.

    private Double minSalary;
    private Double maxSalary;

    private String requiredSkills;     // "Java, Spring Boot, MySQL"

    private Integer minExperience;     // 0 for fresher
    private Integer maxExperience;

    private String qualification;      // "B.Tech, MCA"

    private Integer openings;          // number of vacancies

    private LocalDate deadline;        // last date to apply

    @Builder.Default
    private boolean isActive = true;

    @ManyToOne
    @JoinColumn(name = "company_id")
    @JsonIgnoreProperties({"jobs", "employer"})
    private Company company;

    @ManyToOne
    @JoinColumn(name = "employer_id")
    @JsonIgnoreProperties({"password", "applications"})
    private User employer;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Application> applications;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
