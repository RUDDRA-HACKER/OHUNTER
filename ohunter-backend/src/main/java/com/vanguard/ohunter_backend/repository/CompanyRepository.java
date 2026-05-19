package com.vanguard.ohunter_backend.repository;

import com.vanguard.ohunter_backend.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findFirstByNameIgnoreCase(String name);
}
