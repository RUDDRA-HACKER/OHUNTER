package com.vanguard.ohunter_backend.service;

import com.vanguard.ohunter_backend.enums.ApplicationStatus;
import com.vanguard.ohunter_backend.model.*;
import com.vanguard.ohunter_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    // Student applies for a job
    public Application applyForJob(Long userId, Long jobId, String coverLetter) {

        // Check if already applied
        if (applicationRepository.existsByUserIdAndJobId(userId, jobId)) {
            throw new RuntimeException("You have already applied for this job!");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found!"));

        Application application = Application.builder()
                .user(user)
                .job(job)
                .coverLetter(coverLetter)
                .resumeUrl(user.getResumeUrl())
                .build();

        return applicationRepository.save(application);
    }

    // Get all applications of a student
    public List<Application> getMyApplications(Long userId) {
        return applicationRepository.findByUserId(userId);
    }

    // Get all applicants for a job (Employer view)
    public List<Application> getApplicantsForJob(Long jobId) {
        return applicationRepository.findByJobId(jobId);
    }

    // Update application status (Employer updates)
    public Application updateStatus(Long applicationId, ApplicationStatus status) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found!"));
        app.setStatus(status);
        return applicationRepository.save(app);
    }

    // Withdraw application (Student cancels)
    public void withdrawApplication(Long userId, Long jobId) {
        Application app = applicationRepository.findByUserIdAndJobId(userId, jobId)
                .orElseThrow(() -> new RuntimeException("Application not found!"));
        app.setStatus(ApplicationStatus.WITHDRAWN);
        applicationRepository.save(app);
    }
}
