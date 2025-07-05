package com.example.demo.controller;

import com.example.demo.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin
public class HomeCtrl {
    @Autowired
    private AiService aiService;

    @GetMapping("/facts")
    public ResponseEntity<String> getHealthFacts() {
        System.out.println("home controller");
        String factsJson = aiService.getFacts();
        return ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .body(factsJson);

    }
}
