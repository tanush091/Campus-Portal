package com.anurag.aiml.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.anurag.aiml.dto.EmployeeDto;
import com.anurag.aiml.entity.Employee;
import com.anurag.aiml.exception.ResourceNotFoundException;
import com.anurag.aiml.repository.EmployeeRepository;

@Service
public class EmployeeService {
    private final EmployeeRepository repo;

    public EmployeeService(EmployeeRepository repo) {
        this.repo = repo;
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
        employee.setPassword(dto.getPassword() != null ? dto.getPassword().trim() : "");
        return repo.save(employee);
    }

    public Employee updateEmployee(Long id, EmployeeDto dto) {
        Employee existingEmployee = getEmployeeById(id);
        existingEmployee.setName(dto.getName() != null ? dto.getName().trim() : existingEmployee.getName());
        existingEmployee.setRole(dto.getRole() != null ? dto.getRole().trim() : existingEmployee.getRole());
        existingEmployee.setEmail(dto.getEmail() != null ? dto.getEmail().trim() : existingEmployee.getEmail());
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            existingEmployee.setPassword(dto.getPassword().trim());
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
        if (employee == null || employee.getEmail() == null || employee.getPassword() == null) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email and password are required"));
        }

        String email = employee.getEmail().trim();
        String password = employee.getPassword().trim();

        Optional<Employee> existingEmpOpt = repo.findFirstByEmailAndPassword(email, password);
        if (existingEmpOpt.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }

        Employee existingEmp = existingEmpOpt.get();
        Map<String, Object> response = new HashMap<>();
        response.put("id", existingEmp.getId());
        response.put("name", existingEmp.getName());
        response.put("email", existingEmp.getEmail());
        response.put("role", existingEmp.getRole());
        response.put("message", "Login Successful");
        return ResponseEntity.ok(response);
    }
}
