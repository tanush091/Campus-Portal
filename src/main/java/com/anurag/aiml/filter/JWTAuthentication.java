package com.anurag.aiml.filter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import com.anurag.aiml.entity.Employee;
import com.anurag.aiml.repository.EmployeeRepository;
import com.anurag.aiml.service.JWTService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JWTAuthentication extends OncePerRequestFilter {

    private final JWTService jwtService;
    private final EmployeeRepository repo;

    public JWTAuthentication(JWTService jwtService, EmployeeRepository repo) {
        this.jwtService = jwtService;
        this.repo = repo;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            if (jwtService.validateToken(token)) {
                Long employeeId = jwtService.extractEmployeeId(token);
                Optional<Employee> employeeResult = repo.findById(employeeId);

                if (employeeResult.isPresent()) {
                    Employee employee = employeeResult.get();

                    var authentication =
                            new UsernamePasswordAuthenticationToken(
                                    employee,
                                    null,
                                    List.of(new SimpleGrantedAuthority(
                                            "ROLE_" + employee.getRole()))
                            );

                    SecurityContextHolder.getContext()
                            .setAuthentication(authentication);
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}