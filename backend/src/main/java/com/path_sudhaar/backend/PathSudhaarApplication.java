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

	// This runs automatically on startup to ensure you can always log in
	@Bean
	CommandLineRunner initDatabase(AdminRepository repository) {
		return args -> {
			if (repository.findByUsername("master").isEmpty()) {
				// Creating the Master Admin for NIT Raipur Demo
				repository.save(new Admin("master", "master@123", "MASTER"));
				System.out.println("--------------------------------------");
				System.out.println("🚀 MASTER ADMIN 'master' CREATED!");
				System.out.println("--------------------------------------");
			}
		};
	}
}