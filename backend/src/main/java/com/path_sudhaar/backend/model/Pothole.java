package com.path_sudhaar.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import lombok.Data;

@Entity
@Data // This Lombok annotation creates getters/setters automatically
public class Pothole {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double latitude;
    private double longitude;
    private String status = "PENDING"; // Default status
    private LocalDateTime reportedAt = LocalDateTime.now();
    @Lob
    @Column(columnDefinition = "CLOB") // Use CLOB for long text strings in H2
    private String imageUrl;
}