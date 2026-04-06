package com.path_sudhaar.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.path_sudhaar.backend.model.Admin;
import com.path_sudhaar.backend.repository.AdminRepository;

@SpringBootApplication
public class PathSudhaarApplication {

	public static void main(String[] args) {
		SpringApplication.run(PathSudhaarApplication.class, args);
	}

	@Bean
	CommandLineRunner initDatabase(AdminRepository repository) {
		return args -> {
			// Check if the master admin exists in the new MongoDB collection
			if (repository.findByUsername("master").isEmpty()) {
				// MongoDB will generate a String ID automatically
				repository.save(new Admin("master", "master@123", "MASTER"));

				System.out.println("--------------------------------------");
				System.out.println("🍃 MONGODB INITIALIZED");
				System.out.println("🚀 MASTER ADMIN 'master' CREATED!");
				System.out.println("--------------------------------------");
			} else {
				System.out.println("✅ Master Admin already exists in MongoDB.");
			}
		};
	}
}