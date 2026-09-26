package com.anurag.aiml.service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.anurag.aiml.dto.EmployeeDto;
import com.anurag.aiml.dto.LoginResponseDto;
import com.anurag.aiml.entity.Employee;
import com.anurag.aiml.exception.ConflictException;
import com.anurag.aiml.exception.ResourceNotFoundException;
import com.anurag.aiml.repository.EmployeeRepository;

@Service
public class EmployeeService {
    private final EmployeeRepository repo;
    private final PasswordEncoder passwordEncoder;
    private final JWTService jwtService;

    public EmployeeService(
            EmployeeRepository repo,
            PasswordEncoder passwordEncoder,
            JWTService jwtService) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public List<Employee> getAllEmployees() {
        return repo.findAll();
    }

    public Employee getEmployeeById(Long id) {
        return repo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found with id " + id));
    }

    public Employee createEmployee(EmployeeDto dto) {
        if (repo.existsByEmail(dto.getEmail().trim())) {
            throw new ConflictException("An account with this email already exists");
        }

        Employee employee = new Employee();
        employee.setName(dto.getName().trim());
        employee.setRole(dto.getRole().trim());
        employee.setEmail(dto.getEmail().trim());
        employee.setPassword(passwordEncoder.encode(dto.getPassword().trim()));

        return repo.save(employee);
    }

    public Employee updateEmployee(Long id, EmployeeDto dto) {
        Employee employee = getEmployeeById(id);

        if (dto.getName() != null) {
            employee.setName(dto.getName().trim());
        }
        if (dto.getRole() != null) {
            employee.setRole(dto.getRole().trim());
        }
        if (dto.getEmail() != null) {
            if (repo.existsByEmailAndIdNot(dto.getEmail().trim(), id)) {
                throw new ConflictException("Another account already uses this email");
            }
            employee.setEmail(dto.getEmail().trim());
        }
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            employee.setPassword(
                    passwordEncoder.encode(dto.getPassword().trim()));
        }

        return repo.save(employee);
    }

    public void deleteEmployee(Long id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Employee not found with id " + id);
        }

        repo.deleteById(id);
    }

    public ResponseEntity<?> login(Employee employee) {
        if (employee == null
                || employee.getEmail() == null
                || employee.getPassword() == null
                || employee.getEmail().isBlank()
                || employee.getPassword().isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "Email and password are required"));
        }

        String email = employee.getEmail().trim();
        String password = employee.getPassword().trim();

        // Older data has several rows per email, so check each one (newest first).
        List<Employee> candidates = repo.findByEmail(email);
        candidates.sort(Comparator.comparing(Employee::getId).reversed());

        Optional<Employee> match = candidates.stream()
                .filter(candidate -> passwordMatches(password, candidate))
                .findFirst();

        if (match.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }

        Employee existingEmployee = match.get();

        // Upgrade passwords saved before hashing was added.
        if (!isHashed(existingEmployee.getPassword())) {
            existingEmployee.setPassword(passwordEncoder.encode(password));
            repo.save(existingEmployee);
        }

        LoginResponseDto response = new LoginResponseDto(
                jwtService.generateToken(existingEmployee.getId()),
                existingEmployee.getId(),
                existingEmployee.getName(),
                existingEmployee.getEmail(),
                existingEmployee.getRole(),
                "Login successful");

        return ResponseEntity.ok(response);
    }

    private boolean passwordMatches(String rawPassword, Employee employee) {
        String stored = employee.getPassword();
        if (stored == null || stored.isEmpty()) {
            return false;
        }
        return isHashed(stored)
                ? passwordEncoder.matches(rawPassword, stored)
                : rawPassword.equals(stored);
    }

    private boolean isHashed(String password) {
        // BCrypt hashes look like "$2a$10$..." and are always 60 characters.
        return password != null && password.startsWith("$2") && password.length() == 60;
    }
}
