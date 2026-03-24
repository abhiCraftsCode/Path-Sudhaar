package com.path_sudhaar.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying; // Required for delete
import org.springframework.transaction.annotation.Transactional; // Required for delete

import com.path_sudhaar.backend.model.Admin;

public interface AdminRepository extends JpaRepository<Admin, Long> {

  // 1. Existing method to search by username
  Optional<Admin> findByUsername(String username);

  // 2. Add this to fix the error in your AuthController
  @Modifying
  @Transactional
  void deleteByUsername(String username);
}