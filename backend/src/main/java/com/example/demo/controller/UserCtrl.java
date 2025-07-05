package com.example.demo.controller;

import com.example.demo.CustomUserDetails;
import com.example.demo.JwtUtil;
import com.example.demo.model.*;
import com.example.demo.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin
public class UserCtrl {
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private PasswordEncoder passwordEncoder;


        @PostMapping("/verify-nmc")
        public ResponseEntity<Map<String, Boolean>> verifyNMC(@RequestBody Map<String, String> request) {
            String nmcNumber = request.get("nmcNumber");

            // Simulate NMC verification (replace with actual logic or DB check)
            //boolean isValid = nmcNumber != null && nmcNumber.matches("\\d{6}");

            return ResponseEntity.ok(Map.of("isValid", true));
        }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already in use");
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(Role.valueOf(req.getRole().toUpperCase()));
        user.setNmcNumber(req.getNmcNumber());
        user.setSpecialization(req.getSpecialization());
        user.setLocation(req.getLocation());
        user.setVerified(req.isVerified());


        userRepo.save(user);
        CustomUserDetails userDetails = new CustomUserDetails(user);

        String token = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(
                user.getId(), user.getName(), user.getEmail(), user.getRole(), user.isVerified(), token
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        Optional<User> userOpt = userRepo.findByEmail(req.getEmail());
        if (userOpt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");

        User user = userOpt.get();
//        if(user.getRole()!=req.getRole()){
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
//        }
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }


        if (!user.getRole().name().equalsIgnoreCase(req.getRole())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Role mismatch");
        }
        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(
                user.getId(), user.getName(), user.getEmail(), user.getRole(), user.isVerified(), token
        ));

    }


        @Autowired
        private JwtUtil jwtService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid token");
        }

        String token = authHeader.substring(7);
        String email;

        try {
            email = jwtService.extractUsername(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }

        Optional<User> user = userRepo.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        return ResponseEntity.ok(user);
    }


}



