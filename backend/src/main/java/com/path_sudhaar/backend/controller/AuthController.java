package com.path_sudhaar.backend.controller;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.path_sudhaar.backend.model.Admin;
import com.path_sudhaar.backend.repository.AdminRepository;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AuthController {

  @Autowired
  private AdminRepository adminRepository;

  // --- 1. LOGIN ENDPOINT ---
  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody Admin loginRequest) {
    Optional<Admin> admin = adminRepository.findByUsername(loginRequest.getUsername());

    // Simple password check (Note: For a real app, use BCrypt, but this works for
    // demo)
    if (admin.isPresent() && admin.get().getPassword().equals(loginRequest.getPassword())) {
      return ResponseEntity.ok(admin.get());
    }
    return ResponseEntity.status(401).body("Invalid Username or Password");
  }

  // --- 2. REGISTRATION ENDPOINT ---
  @PostMapping("/register")
  public ResponseEntity<?> register(@RequestBody Admin newAdmin) {
    if (adminRepository.findByUsername(newAdmin.getUsername()).isPresent()) {
      return ResponseEntity.badRequest().body("Username already exists!");
    }
    Admin savedAdmin = adminRepository.save(newAdmin);
    return ResponseEntity.ok(savedAdmin);
  }

  // --- 3. DELETE ENDPOINT ---
  // Removed @Transactional as MongoDB Repository handles deleteByUsername
  // natively
  @DeleteMapping("/deleteByUsername")
  public ResponseEntity<Void> deleteAdminByUsername(@RequestParam String username) {
    try {
      Optional<Admin> admin = adminRepository.findByUsername(username);
      if (admin.isPresent()) {
        adminRepository.deleteByUsername(username);
        return ResponseEntity.ok().build();
      }
      return ResponseEntity.notFound().build();
    } catch (Exception e) {
      return ResponseEntity.status(500).build();
    }
  }
}