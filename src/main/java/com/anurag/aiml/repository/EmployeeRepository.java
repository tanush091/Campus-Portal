package com.anurag.aiml.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.anurag.aiml.entity.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findFirstByEmailAndPassword(String email, String password);
    List<Employee> findByEmail(String email);
}
