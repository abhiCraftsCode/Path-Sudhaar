package com.path_sudhaar.backend.repository;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.path_sudhaar.backend.model.Admin;

@Repository
public interface AdminRepository extends MongoRepository<Admin, String> {

  Optional<Admin> findByUsername(String username);

  void deleteByUsername(String username);
}