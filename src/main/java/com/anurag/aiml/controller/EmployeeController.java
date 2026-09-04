package com.anurag.aiml.controller;

import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.anurag.aiml.dto.EmployeeDto;
import com.anurag.aiml.entity.Employee;
import com.anurag.aiml.service.EmployeeService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin("http://localhost:5173")
@RequestMapping("/employee")
public class EmployeeController {
    private final EmployeeService service;

    public EmployeeController(EmployeeService service) {
        this.service = service;
    }

    // GET localhost:8080/employee
    @GetMapping
    public List<Employee> getAllEmployees() {
        return service.getAllEmployees();
    }
    @PostMapping("/login")
    public ResponseEntity<?> login (@RequestBody Employee emp){
        return service.login(emp);
    }

    // GET localhost:8080/employee/3
    @GetMapping("/{id}")
    public Employee getEmployeeById(@PathVariable Long id) {
        return service.getEmployeeById(id);
    }
    
    // POST localhost:8080/employee
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Employee createEmployee(@Valid @RequestBody EmployeeDto dto) {
        return service.createEmployee(dto);
    }

    // PUT localhost:8080/employee/3
    @PutMapping("/{id}")
    public Employee updateEmployee(@PathVariable Long id, @Valid @RequestBody EmployeeDto dto) {
        return service.updateEmployee(id, dto);
    }

    // DELETE localhost:8080/employee/3
    @DeleteMapping("/{id}")
    public Map<String, String> deleteEmployee(@PathVariable Long id) {
        service.deleteEmployee(id);
        return Map.of("message", "Employee deleted successfully");
    }
}
