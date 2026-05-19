package com.vanguard.ohunter_backend.service;
import com.vanguard.ohunter_backend.model.Job;
import com.vanguard.ohunter_backend.model.Company;
import com.vanguard.ohunter_backend.model.User;
import com.vanguard.ohunter_backend.repository.CompanyRepository;
import com.vanguard.ohunter_backend.repository.JobRepository;
import com.vanguard.ohunter_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    // Get all active jobs
    public List<Job> getAllJobs() {
        return jobRepository.findAll()
                .stream()
                .filter(Job::isActive)
                .toList();
    }

    // Search jobs by keyword
    public List<Job> searchJobs(String keyword) {
        return jobRepository.searchJobs(keyword);
    }

    // Get jobs by location
    public List<Job> getJobsByLocation(String location) {
        return jobRepository.findByLocationContainingIgnoreCaseAndIsActiveTrue(location);
    }

    // Get single job
    public Job getJobById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found!"));
    }

    public List<Job> getJobsByEmployer(Long employerId) {
        return jobRepository.findByEmployerIdAndIsActiveTrue(employerId);
    }

    // Post a new job
    public Job createJob(Job job, Long employerId) {
        User employer = null;
        if (employerId != null) {
            employer = userRepository.findById(employerId)
                    .orElseThrow(() -> new RuntimeException("Employer not found!"));
            job.setEmployer(employer);
        }
        job.setCompany(resolveCompany(job.getCompany(), employer, null));
        return jobRepository.save(job);
    }

    // Update job
    public Job updateJob(Long id, Job updatedJob) {
        Job job = getJobById(id);
        job.setTitle(updatedJob.getTitle());
        job.setDescription(updatedJob.getDescription());
        job.setLocation(updatedJob.getLocation());
        job.setJobType(updatedJob.getJobType());
        job.setMinSalary(updatedJob.getMinSalary());
        job.setMaxSalary(updatedJob.getMaxSalary());
        job.setRequiredSkills(updatedJob.getRequiredSkills());
        job.setMinExperience(updatedJob.getMinExperience());
        job.setMaxExperience(updatedJob.getMaxExperience());
        job.setQualification(updatedJob.getQualification());
        job.setOpenings(updatedJob.getOpenings());
        job.setDeadline(updatedJob.getDeadline());
        job.setActive(updatedJob.isActive());
        job.setCompany(resolveCompany(updatedJob.getCompany(), job.getEmployer(), job.getCompany()));
        return jobRepository.save(job);
    }

    // Delete (deactivate) job
    public void deleteJob(Long id) {
        Job job = getJobById(id);
        job.setActive(false);
        jobRepository.save(job);
    }

    // Get jobs for freshers
    public List<Job> getFresherJobs() {
        return jobRepository.findByMinExperienceAndIsActiveTrue(0);
    }

    private Company resolveCompany(Company requestedCompany, User employer, Company existingCompany) {
        if (requestedCompany == null || requestedCompany.getName() == null || requestedCompany.getName().isBlank()) {
            return existingCompany;
        }

        Company company = requestedCompany.getId() != null
                ? companyRepository.findById(requestedCompany.getId()).orElse(existingCompany)
                : companyRepository.findFirstByNameIgnoreCase(requestedCompany.getName().trim()).orElse(existingCompany);

        if (company == null) {
            company = new Company();
        }

        company.setName(requestedCompany.getName().trim());

        if (company.getEmployer() == null) {
            company.setEmployer(employer);
        }

        return companyRepository.save(company);
    }
}
