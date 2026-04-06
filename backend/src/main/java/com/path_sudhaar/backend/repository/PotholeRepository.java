package com.path_sudhaar.backend.repository;

import com.path_sudhaar.backend.model.Pothole;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PotholeRepository extends MongoRepository<Pothole, String> {
}