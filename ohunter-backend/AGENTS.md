# AGENTS.md - OHunter Backend Developer Guide

This Spring Boot 3.2 job portal backend connects students/job-seekers with employers. Understand these architectural patterns before making changes.

## Project Architecture

**Tech Stack:** Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA, MySQL, JWT, Lombok

**Core Domain Model:**
- **Users** (4 roles): `STUDENT_FRESHER`, `STUDENT_EXPERIENCED`, `EMPLOYER`, `ADMIN`
- **Jobs**: Posted by employers, with salary range, skills requirements, experience levels, deadlines
- **Applications**: Represents student applications to jobs with status tracking
- **Companies**: Job postings are linked to company entities

**Key Package Structure:**
```
src/main/java/com/vanguard/ohunter_backend/
├── model/          # JPA entities (User, Job, Application, Company)
├── repository/     # Spring Data interfaces for CRUD + custom queries
├── service/        # Business logic (AuthService, JobService, ApplicationService)
├── controller/     # REST endpoints (AuthController, JobController, ApplicationController)
├── dto/           # Data transfer objects for requests/responses
├── security/      # JWT token generation, authentication filter
├── config/        # SecurityConfig, CORS setup
├── exception/     # Custom exceptions and global handler
└── enums/         # role, JobType, ApplicationStatus
```

## Critical Architectural Patterns

### 1. JWT-Based Stateless Authentication
- **Token Generation:** `JwtUtil.generateToken(email)` creates HS256-signed tokens with 24h expiration (86400000ms)
- **Token Validation:** `JwtAuthenticationFilter` extracts Bearer tokens from `Authorization` header
- **Email as Subject:** JWT subject contains user email (not ID) for identity
- **Where:** `config/SecurityConfig.java` chains `JwtAuthenticationFilter` before `UsernamePasswordAuthenticationFilter`
- **Required for new endpoints:** All non-`/api/auth/**` endpoints must be protected; add `@PreAuthorize` annotations if role-based access needed

### 2. Exception Handling Pattern
- All exceptions routed through `@RestControllerAdvice` in `GlobalExceptionHandler.java`
- **Custom exceptions:** Throw specific exceptions (DuplicateEmailException, ResourceNotFoundException, InvalidCredentialsException)
- **HTTP Status Mapping:**
  - `DuplicateEmailException` → 409 CONFLICT
  - `InvalidCredentialsException` → 401 UNAUTHORIZED
  - `ResourceNotFoundException` → 404 NOT_FOUND
  - `RuntimeException` → 400 BAD_REQUEST
- Response format: `{timestamp, status, error}`

### 3. Entity Lifecycle Management
All entities use `@PrePersist` / `@PreUpdate` JPA callbacks:
- `createdAt` set only on insert, immutable via `@Column(updatable = false)`
- `updatedAt` auto-updated on every modification
- **Pattern:** Never manually manage timestamps in service layer

### 4. Lombok Boilerplate Reduction
- All entities use: `@Data` (getters/setters), `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder`
- DTOs use: `@Data` with validation annotations
- Services use: `@RequiredArgsConstructor` for dependency injection
- **Note:** Annotation processor configured in `pom.xml` for Maven compilation

### 5. Service Layer Pattern
- Services use constructor injection via `@RequiredArgsConstructor`
- Example (AuthService):
  ```java
  @Service @RequiredArgsConstructor
  public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
  }
  ```
- Password encoding: Always use injected `PasswordEncoder` (BCrypt), never plain text

### 6. Validation Pattern
- DTO field validation via `jakarta.validation.constraints` (not `javax.*`)
- Example (RegisterRequest):
  - `@Email` for email format
  - `@Size(min=6)` for password length
  - `@Pattern(regexp="^[0-9]{10}$")` for phone validation
- Apply `@Valid` in controller methods to trigger validation
- Invalid requests auto-return 400 with constraint violation messages

### 7. Relationship Mapping
- **One-to-Many:** `User` has many `Applications` via `mappedBy` + `CascadeType.ALL`
- **Many-to-One:** `Application` → `User`, `Application` → `Job`, `Job` → `Company`, `Job` → `User` (employer)
- Default fetch strategy is LAZY; be aware of N+1 query problems in service methods
- **Repository custom queries:** Extend `JpaRepository` with query methods (e.g., `findByEmail`, `existsByEmail`)

## Build, Test & Run

**Build:**
```powershell
mvn clean install
# Produces: target/ohunter-backend-0.0.1-SNAPSHOT.jar
```

**Run Local Server:**
```powershell
mvn spring-boot:run
# Starts on http://localhost:8080
```

**Test:**
```powershell
mvn test
# Runs JUnit tests in src/test/java
```

**Database Setup:**
- MySQL running on `localhost:3306` with credentials in `application.properties`
- Database: `ohunter`, user: `root`, password: `rudra@18`
- `spring.jpa.hibernate.ddl-auto=update` auto-creates/updates schema on startup
- View generated SQL: `spring.jpa.show-sql=true` (currently enabled)

## Package-Specific Conventions

### DTOs (src/main/java/.../dto/)
- Request DTOs: In `request/` subfolder, suffix with `Request` (e.g., `LoginRequest`, `RegisterRequest`)
- Response DTOs: In `response/` subfolder, suffix with `Response` (e.g., `AuthResponse`)
- All have `@Data` annotation, validation constraints in requests only

### Enums (src/main/java/.../enums/)
- **role enum:** Uses uppercase names for JPA `@Enumerated(EnumType.STRING)` storage
- **ApplicationStatus:** Maps application workflow states (APPLIED, SHORTLISTED, REJECTED, HIRED)
- **JobType:** Defines employment types (FULL_TIME, PART_TIME, INTERNSHIP, CONTRACT)

### Repositories (src/main/java/.../repository/)
- Extend `JpaRepository<Entity, Long>` where Long is primary key type
- Custom methods: Use Spring Data query method naming or `@Query` annotations
- Example: `findByEmail(String email)` returns `Optional<User>`

### Controllers (src/main/java/.../controller/)
- Base path: `/api/{resource}` (e.g., `/api/auth`, `/api/jobs`, `/api/applications`)
- All methods return `ResponseEntity<T>` for consistent HTTP status control
- Use `@Valid` on DTO parameters to trigger validation
- Public endpoints under `/api/auth/**` (register, login); others protected by JWT filter

## Security & Configuration

**SecurityConfig.java (config/ package):**
- CORS enabled for all origins (`*`), all methods, all headers
- CSRF disabled (stateless JWT design)
- Session policy: `STATELESS` (no session creation)
- Auth routes: `/api/auth/**` permit-all; others require JWT token
- Password encoding: `BCryptPasswordEncoder` bean configured
- Custom `UserDetailsService` implementation: `UserDetailsServiceImpl` loads users by email

**JWT Configuration (application.properties):**
- Secret: `verysecretkeyverysecretkeyverysecretkeyverysecretkey` (24h expiration)
- ⚠️ Production: Externalize this to environment variables/vault

## Common Tasks for AI Agents

### Adding a New Protected Endpoint
1. Create Request/Response DTOs in `dto/request/` and `dto/response/`
2. Add method in relevant Service class (e.g., `JobService`)
3. Add `@PostMapping` or `@GetMapping` in corresponding Controller
4. No SecurityConfig changes needed; JWT filter applies to all non-auth routes
5. Optional: Add `@PreAuthorize("hasRole('ROLE_NAME')")` for role-based access

### Adding a New Entity
1. Create `@Entity` class in `model/` with Lombok annotations
2. Add `@PrePersist` and `@PreUpdate` methods for timestamps
3. Create Repository interface in `repository/` extending `JpaRepository`
4. Define relationships with existing entities using `@ManyToOne`, `@OneToMany`
5. Hibernate auto-updates schema (ddl-auto=update); inspect logs for DDL

### Handling Business Logic Errors
1. Throw custom exceptions extending `RuntimeException`
2. Register handler in `GlobalExceptionHandler.java` with appropriate HTTP status
3. Exception message automatically included in response JSON

### Testing
- Unit tests in `src/test/java/com/vanguard/ohunter_backend/`
- Use `@SpringBootTest` for integration tests
- Mock repositories with `@MockBean`
- Current test file: `OhunterBackendApplicationTests.java`

## Important Notes for AI Agents

- **Naming:** Enum `role` uses lowercase (not convention); keep consistent
- **Package:** Always use `com.vanguard.ohunter_backend.*` (not `com.vanguard.ohunter-backend.*`)
- **Timestamps:** Use `LocalDateTime`, not `Date` or `long`
- **Validation:** Use Jakarta (not Javax) constraints for Spring Boot 3.x compatibility
- **Database:** MySQL 8 dialect configured; ensure `InnoDB` storage engine for transactions
- **Lombok:** Annotation processor in pom.xml is critical; if IDEs don't see generated methods, rebuild project

