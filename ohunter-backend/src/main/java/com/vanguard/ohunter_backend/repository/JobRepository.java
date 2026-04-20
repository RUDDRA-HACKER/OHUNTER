package com.vanguard.ohunter_backend.repository;

import com.vanguard.ohunter_backend.enums.JobType;
import com.vanguard.ohunter_backend.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    // Find active jobs by location
    List<Job> findByLocationContainingIgnoreCaseAndIsActiveTrue(String location);

    // Find jobs by type
    List<Job> findByJobTypeAndIsActiveTrue(JobType jobType);

    // Search jobs by title or skills
    @Query("SELECT j FROM Job j WHERE " +
            "(LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(j.requiredSkills) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND j.isActive = true")
    List<Job> searchJobs(@Param("keyword") String keyword);

    // Find jobs for fresher (0 experience)
    List<Job> findByMinExperienceAndIsActiveTrue(Integer minExperience);

    // Find jobs by employer
    List<Job> findByEmployerIdAndIsActiveTrue(Long employerId);

    // Find jobs by company
    List<Job> findByCompanyIdAndIsActiveTrue(Long companyId);
}