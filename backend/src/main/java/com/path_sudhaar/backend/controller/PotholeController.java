package com.path_sudhaar.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.path_sudhaar.backend.model.Pothole;
import com.path_sudhaar.backend.repository.PotholeRepository;

@RestController
@RequestMapping("/api/potholes")
@CrossOrigin(origins = "*") // Allows your React frontend to talk to this Java backend
public class PotholeController {

    @Autowired
    private PotholeRepository repository;

    // GET: View all reported potholes (For the Authority Dashboard)
    @GetMapping
    public List<Pothole> getAllPotholes() {
        return repository.findAll();
    }

    // POST: Create a new report (When you click 'Submit' on your phone)
    @PostMapping
    public Pothole reportPothole(@RequestBody Pothole pothole) {
        return repository.save(pothole);
    }
}