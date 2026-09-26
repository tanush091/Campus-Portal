package com.anurag.aiml.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class EmployeeDto {
    /** Validation group for rules that only apply when creating an employee. */
    public interface OnCreate {
    }

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Role is required")
    private String role;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    // Required on create; on update a blank password means "keep the current one".
    @NotBlank(message = "Password is required", groups = OnCreate.class)
    @Pattern(regexp = "^$|.{8,}", message = "Atleast password required 8 char")
    private String password;

    public EmployeeDto() {
    }

    public String getName() {
        return name;
    }

    public String getRole() {
        return role;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
