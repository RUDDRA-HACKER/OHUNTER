package com.vanguard.ohunter_backend.controller;

import com.vanguard.ohunter_backend.model.Job;
import com.vanguard.ohunter_backend.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    // GET /api/jobs - get all jobs (public)
    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    // GET /api/jobs/search?keyword=java
    @GetMapping("/search")
    public ResponseEntity<List<Job>> searchJobs(@RequestParam String keyword) {
        return ResponseEntity.ok(jobService.searchJobs(keyword));
    }

    // GET /api/jobs/location?city=bhubaneswar
    @GetMapping("/location")
    public ResponseEntity<List<Job>> getByLocation(@RequestParam String city) {
        return ResponseEntity.ok(jobService.getJobsByLocation(city));
    }

    // GET /api/jobs/fresher - fresher jobs
    @GetMapping("/fresher")
    public ResponseEntity<List<Job>> getFresherJobs() {
        return ResponseEntity.ok(jobService.getFresherJobs());
    }

    // GET /api/jobs/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Job> getJob(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    // GET /api/jobs/employer/{employerId}
    @GetMapping("/employer/{employerId}")
    public ResponseEntity<List<Job>> getEmployerJobs(@PathVariable Long employerId) {
        return ResponseEntity.ok(jobService.getJobsByEmployer(employerId));
    }

    // POST /api/jobs - employer only
    @PostMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Job> createJob(
            @RequestBody Job job,
            @RequestParam(required = false) Long employerId) {
        return ResponseEntity.ok(jobService.createJob(job, employerId));
    }

    // PUT /api/jobs/{id} - employer only
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<Job> updateJob(@PathVariable Long id, @RequestBody Job job) {
        return ResponseEntity.ok(jobService.updateJob(id, job));
    }

    // DELETE /api/jobs/{id} - employer or admin
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER') or hasRole('ADMIN')")
    public ResponseEntity<String> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok("Job deleted successfully!");
    }
}
