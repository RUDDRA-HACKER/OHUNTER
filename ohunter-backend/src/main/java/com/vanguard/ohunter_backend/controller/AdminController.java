package com.vanguard.ohunter_backend.controller;

import com.vanguard.ohunter_backend.model.Job;
import com.vanguard.ohunter_backend.model.User;
import com.vanguard.ohunter_backend.model.Application;
import com.vanguard.ohunter_backend.repository.ApplicationRepository;
import com.vanguard.ohunter_backend.repository.UserRepository;
import com.vanguard.ohunter_backend.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final JobService jobService;
    private final ApplicationRepository applicationRepository;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> listUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/jobs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Job>> listJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    @GetMapping("/applications")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Application>> listApplications() {
        return ResponseEntity.ok(applicationRepository.findAll());
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> stats() {
        Map<String, Object> m = new HashMap<>();
        m.put("users", userRepository.count());
        m.put("jobs", jobService.getAllJobs().size());
        m.put("applications", applicationRepository.count());
        return ResponseEntity.ok(m);
    }
}
