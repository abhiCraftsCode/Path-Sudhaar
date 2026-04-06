package com.path_sudhaar.backend.controller;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Base64; // Correct import for Base64
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.path_sudhaar.backend.model.Pothole;
import com.path_sudhaar.backend.repository.PotholeRepository;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/potholes")
public class PotholeController {

    private static final Logger logger = LoggerFactory.getLogger(PotholeController.class);

    @Autowired
    private PotholeRepository repository;

    // 1. GET: Fetch all (MongoDB returns a List of Documents)
    @GetMapping
    public List<Pothole> getAllPotholes() {
        return repository.findAll();
    }

    // 2. PUT: Update Status (ID is now String)
    @PutMapping("/{id}/status")
    public ResponseEntity<Pothole> updateStatus(@PathVariable String id, @RequestParam String status) {
        return repository.findById(id).map(pothole -> {
            pothole.setStatus(status);
            Pothole updated = repository.save(pothole);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    // 3. POST: Report a Pothole
    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<?> reportPothole(
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude,
            @RequestParam("status") String status,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        try {
            logger.info("🚨 New MongoDB Pothole Entry: Lat {}, Lng {}", latitude, longitude);

            Pothole pothole = new Pothole();
            pothole.setLatitude(latitude);
            pothole.setLongitude(longitude);
            pothole.setStatus(status);
            pothole.setReportedAt(LocalDateTime.now());

            if (image != null && !image.isEmpty()) {
                byte[] bytes = image.getBytes();
                // MongoDB can handle large strings much better than H2
                String base64Image = Base64.getEncoder().encodeToString(bytes);
                pothole.setImageUrl("data:image/jpeg;base64," + base64Image);
            } else {
                pothole.setImageUrl("https://via.placeholder.com/150?text=No+Image");
            }

            Pothole savedPothole = repository.save(pothole);
            return ResponseEntity.ok(savedPothole);

        } catch (IOException | RuntimeException e) {
            logger.error("❌ MongoDB Save Error: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    // 4. DELETE: Remove a record (ID is now String)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePothole(@PathVariable String id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}