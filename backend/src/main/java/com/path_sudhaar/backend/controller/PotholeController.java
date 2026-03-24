package com.path_sudhaar.backend.controller;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
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

    // 1. GET: Fetch all potholes for the Admin Map
    @GetMapping
    public List<Pothole> getAllPotholes() {
        return repository.findAll();
    }

    // 2. PUT: Update Status (PENDING -> FIXED)
    @PutMapping("/{id}/status")
    public ResponseEntity<Pothole> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return repository.findById(id).map(pothole -> {
            pothole.setStatus(status);
            Pothole updated = repository.save(pothole);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * 3. POST: Report a Pothole
     * Handles Multipart/Form-Data (Image + Coords) from React PublicReport.js
     */

    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<?> reportPothole(
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude,
            @RequestParam("status") String status,
            @RequestParam("image") MultipartFile image) {

        try {
            logger.info("🚨 New Pothole Reported: Lat {}, Lng {}", latitude, longitude);

            Pothole pothole = new Pothole();
            pothole.setLatitude(latitude);
            pothole.setLongitude(longitude);
            pothole.setStatus(status);
            pothole.setReportedAt(LocalDateTime.now());
            if (image != null && !image.isEmpty()) {
                byte[] bytes = image.getBytes();
                String base64Image = java.util.Base64.getEncoder().encodeToString(bytes);
                // Prefixing with "data:image/jpeg;base64," tells the browser how to read it
                pothole.setImageUrl("data:image/jpeg;base64," + base64Image);
            } else {
                pothole.setImageUrl("https://via.placeholder.com/150?text=No+Image");
            }
            Pothole savedPothole = repository.save(pothole);
            return ResponseEntity.ok(savedPothole);

        } catch (IOException | RuntimeException e) {
            logger.error("❌ Save Error: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    // 4. DELETE: Remove a record
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePothole(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}