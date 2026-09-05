package com.anurag.aiml.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.anurag.aiml.dto.EmployeeDto;
import com.anurag.aiml.entity.Employee;
import com.anurag.aiml.exception.ResourceNotFoundException;
import com.anurag.aiml.repository.EmployeeRepository;

@Service
public class EmployeeService {
    private final EmployeeRepository repo;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(EmployeeRepository repo, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Employee> getAllEmployees() {
        return repo.findAll();
    }
    
    public Employee getEmployeeById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id " + id));
    }

    public Employee createEmployee(EmployeeDto dto) {
        Employee employee = new Employee();
        employee.setName(dto.getName() != null ? dto.getName().trim() : "");
        employee.setRole(dto.getRole() != null ? dto.getRole().trim() : "Student");
        employee.setEmail(dto.getEmail() != null ? dto.getEmail().trim() : "");
        
        String rawPassword = dto.getPassword() != null ? dto.getPassword().trim() : "";
        employee.setPassword(rawPassword.isEmpty() ? "" : passwordEncoder.encode(rawPassword));
        
        return repo.save(employee);
    }

    public Employee updateEmployee(Long id, EmployeeDto dto) {
        Employee existingEmployee = getEmployeeById(id);
        existingEmployee.setName(dto.getName() != null ? dto.getName().trim() : existingEmployee.getName());
        existingEmployee.setRole(dto.getRole() != null ? dto.getRole().trim() : existingEmployee.getRole());
        existingEmployee.setEmail(dto.getEmail() != null ? dto.getEmail().trim() : existingEmployee.getEmail());
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            existingEmployee.setPassword(passwordEncoder.encode(dto.getPassword().trim()));
        }
        return repo.save(existingEmployee);
    }

    public void deleteEmployee(Long id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Employee not found with id " + id);
        }
        repo.deleteById(id);
    }

    public ResponseEntity<?> login(Employee employee) {
        Employee existingEmp = repo.findByEmail(employee.getEmail());
        if (employee == null || employee.getEmail() == null || employee.getPassword() == null) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email and password are required"));
        }
        if(encoder.matches(employee.getPassword(),existingEmp.getPassword())){
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("Password is wrong...");
        }
        return ResponseEntity.ok(body: "Login Success");
        String email = employee.getEmail().trim();
        String password = employee.getPassword().trim();

        // 1. Look up employee by email
        Optional<Employee> existingEmpOpt = repo.findFirstByEmail(email);
        if (existingEmpOpt.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }

        Employee existingEmp = existingEmpOpt.get();

        // 2. Verify hashed password with passwordEncoder.matches() (with fallback to plaintext for existing records)
        boolean passwordMatches = passwordEncoder.matches(password, existingEmp.getPassword())
                || password.equals(existingEmp.getPassword());

        if (!passwordMatches) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", existingEmp.getId());
        response.put("name", existingEmp.getName());
        response.put("email", existingEmp.getEmail());
        response.put("role", existingEmp.getRole());
        response.put("password", existingEmp.getPassword());
        response.put("message", "Login Successful");
        return ResponseEntity.ok(response);
    }
}
