package com.example.demo;

import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired
    private CustomUserDetailsService userDetailsService;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserRepo userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@RequestBody AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(Map.of("token", token));
    }

    @GetMapping("/oauth-success")
    public ResponseEntity<?> oauthSuccess(OAuth2AuthenticationToken token) {
        String email = token.getPrincipal().getAttribute("email");
        Optional<User> optional = userRepository.findByEmail(email);

        User user = optional.orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(token.getPrincipal().getAttribute("name"));
            newUser.setVerified(true);
            newUser.setRole(Role.DOCTOR); // Default role or logic
            return userRepository.save(newUser);
        });

        String jwt = jwtUtil.generateToken(new CustomUserDetails(user));
        return ResponseEntity.ok(Map.of("token", jwt));
    }
}

