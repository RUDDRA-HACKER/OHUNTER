package com.vanguard.ohunter_backend.repository;

import com.vanguard.ohunter_backend.enums.ApplicationStatus;
import com.vanguard.ohunter_backend.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    // All applications by a student
    List<Application> findByUserId(Long userId);

    // All applications for a job
    List<Application> findByJobId(Long jobId);

    // Check if student already applied
    boolean existsByUserIdAndJobId(Long userId, Long jobId);

    // Get specific application
    Optional<Application> findByUserIdAndJobId(Long userId, Long jobId);

    // Filter applications by status
    List<Application> findByJobIdAndStatus(Long jobId, ApplicationStatus status);
}