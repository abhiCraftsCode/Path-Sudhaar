package com.path_sudhaar.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.path_sudhaar.backend.model.Pothole;

@Repository
public interface PotholeRepository extends JpaRepository<Pothole, Long> {
    // Basic CRUD (Create, Read, Update, Delete) are included automatically!
}