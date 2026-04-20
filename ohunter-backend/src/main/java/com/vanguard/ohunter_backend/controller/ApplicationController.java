package com.vanguard.ohunter_backend.controller;

import com.vanguard.ohunter_backend.enums.ApplicationStatus;
import com.vanguard.ohunter_backend.model.Application;
import com.vanguard.ohunter_backend.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    // POST /api/applications/apply/{jobId}
    @PostMapping("/apply/{jobId}")
    public ResponseEntity<Application> applyForJob(
            @PathVariable Long jobId,
            @RequestParam Long userId,
            @RequestParam(required = false) String coverLetter) {
        return ResponseEntity.ok(
                applicationService.applyForJob(userId, jobId, coverLetter)
        );
    }

    // GET /api/applications/my/{userId}
    @GetMapping("/my/{userId}")
    public ResponseEntity<List<Application>> getMyApplications(@PathVariable Long userId) {
        return ResponseEntity.ok(applicationService.getMyApplications(userId));
    }

    // GET /api/applications/job/{jobId}
    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<Application>> getApplicants(@PathVariable Long jobId) {
        return ResponseEntity.ok(applicationService.getApplicantsForJob(jobId));
    }

    // PUT /api/applications/{id}/status
    @PutMapping("/{id}/status")
    public ResponseEntity<Application> updateStatus(
            @PathVariable Long id,
            @RequestParam ApplicationStatus status) {
        return ResponseEntity.ok(applicationService.updateStatus(id, status));
    }

    // DELETE /api/applications/withdraw
    @DeleteMapping("/withdraw")
    public ResponseEntity<String> withdraw(
            @RequestParam Long userId,
            @RequestParam Long jobId) {
        applicationService.withdrawApplication(userId, jobId);
        return ResponseEntity.ok("Application withdrawn!");
    }
}
