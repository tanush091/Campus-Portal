package com.anurag.aiml.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.anurag.aiml.entity.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findFirstByEmailAndPassword(String email, String password);
    Optional<Employee> findFirstByEmail(String email);
    List<Employee> findByEmail(String email);
}
