package com.path_sudhaar.backend.model;

import java.time.LocalDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Document(collection = "potholes")
@Data
public class Pothole {

    @Id
    private String id;

    private double latitude;
    private double longitude;
    private String status = "PENDING";
    private LocalDateTime reportedAt = LocalDateTime.now();
    private String imageUrl;
}