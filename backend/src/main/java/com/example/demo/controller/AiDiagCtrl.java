package com.example.demo.controller;

import com.example.demo.model.AIDiagnosis;
import com.example.demo.model.DiagnosisRequest;
import com.example.demo.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin
public class AiDiagCtrl {
    @Autowired
    private AiService aiService;

    @PostMapping("/aiDiag") // 🔸 matches the frontend call
    public ResponseEntity<AIDiagnosis> getAIDiagnosis(@RequestBody DiagnosisRequest request) {
        return aiService.diagnose(request.getSymptoms());

    }
}
