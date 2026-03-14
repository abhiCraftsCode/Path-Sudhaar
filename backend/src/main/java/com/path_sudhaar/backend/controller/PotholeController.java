package com.path_sudhaar.backend.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.path_sudhaar.backend.model.Pothole;
import com.path_sudhaar.backend.repository.PotholeRepository;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/potholes")
// Allows your React frontend to talk to this Java backend
public class PotholeController {

    private static final Logger logger = LoggerFactory.getLogger(PotholeController.class);
    @Autowired
    private PotholeRepository repository;

    // GET: View all reported potholes (For the Authority Dashboard)
    @GetMapping
    public List<Pothole> getAllPotholes() {
        return repository.findAll();
    }

    @PutMapping("/{id}/status")
    public Pothole updateStatus(@PathVariable Long id, @RequestParam String status) {
        Pothole pothole = repository.findById(id).orElseThrow();
        pothole.setStatus(status);
        return repository.save(pothole);
    }

    @DeleteMapping("/{id}")
    public void deletePothole(@PathVariable Long id) {
        // This tells the database to find the row with this ID and remove it
        repository.deleteById(id);
    }

    // POST: Create a new report (When you click 'Submit' on your phone)
    @PostMapping
    public Pothole reportPothole(@RequestBody Pothole pothole) {
        logger.info("🚨 New Pothole Reported at Lat: {}, Long: {}", pothole.getLatitude(), pothole.getLongitude());
        return repository.save(pothole);
    }
}