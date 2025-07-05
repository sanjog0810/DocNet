package com.example.demo.controller;

import com.example.demo.model.ConsultReq;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.ConsultReqRepo;
import com.example.demo.repository.UserRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController

@CrossOrigin
public class ReqDocCtrl {

    @Autowired
    private UserRepo userRepo;
    @Autowired
    private ConsultReqRepo consultationRepo;

    @GetMapping("/consultations/doctors")
    public List<User> getAllDoctors() {
        return userRepo.findByRole(Role.DOCTOR);
    }

    @PostMapping("/consultations/request")
    public ResponseEntity<?> sendConsultationRequest(
            @RequestParam("file") MultipartFile file,
            @RequestParam String message,
            @RequestParam Long doctorId,
            @RequestParam Long patientId
    ) throws IOException {
        Optional<User> doctorOpt = userRepo.findById(doctorId);
        Optional<User> patientOpt = userRepo.findById(patientId);

        if (doctorOpt.isEmpty() || patientOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid doctor or patient ID.");
        }

        if (doctorOpt.get().getRole() != Role.DOCTOR || patientOpt.get().getRole() != Role.PATIENT) {
            return ResponseEntity.badRequest().body("Role mismatch.");
        }

        ConsultReq req = new ConsultReq();
        req.setDoctor(doctorOpt.get());
        req.setPatient(patientOpt.get());
        req.setMessage(message);
        req.setDocument(file.getBytes());
        req.setFileName(file.getOriginalFilename());
        req.setFileType(file.getContentType());

        consultationRepo.save(req);
        return ResponseEntity.ok("Request sent");
    }

    @GetMapping("/status")
    public List<ConsultReq> getStatus(@RequestParam Long patientId) {
        return consultationRepo.findByPatientId(patientId);
    }

    @PostMapping("/approve")
    public ResponseEntity<?> approveRequest(@RequestParam Long requestId) {
        var req = consultationRepo.findById(requestId).orElse(null);
        if (req == null) return ResponseEntity.badRequest().body("Invalid ID");
        req.setStatus("approved");
        consultationRepo.save(req);
        return ResponseEntity.ok("Approved");
    }


    @GetMapping("/consultations/doctor/{doctorId}")
    public List<ConsultReq> getDoctorRequests(@PathVariable Long doctorId) {
        return consultationRepo.findByDoctorIdAndStatusNot(doctorId, "approved");
    }

    @Transactional
    @GetMapping("/consultations/download/{requestId}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long requestId) {
        ConsultReq req = consultationRepo.findById(requestId).orElseThrow();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + req.getFileName())
                .contentType(MediaType.parseMediaType(req.getFileType()))
                .body(req.getDocument());
    }
    @PostMapping("/consultations/approve")
    public ResponseEntity<String> approveRequest(
            @RequestParam Long requestId,
            @RequestParam String doctorMessage) {
        Optional<ConsultReq> optionalReq = consultationRepo.findById(requestId);

        if (optionalReq.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Request not found");
        }

        ConsultReq req = optionalReq.get();
        req.setStatus("approved");
        req.setDoctorMessage(doctorMessage);
        consultationRepo.save(req);

        return ResponseEntity.ok("Request approved with message");
    }
    @GetMapping("/consultations/status/{patientId}")
    public ResponseEntity<List<Map<String, Object>>> getPatientConsultationStatus(@PathVariable String patientId) {
        Long id = Long.parseLong(patientId);
        List<ConsultReq> consults = consultationRepo.findByPatientId(id);

        List<Map<String, Object>> response = consults.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("doctorId", c.getDoctor().getId());
            map.put("status", c.getStatus());
            map.put("doctorMessage", c.getDoctorMessage());
            return map;
        }).toList();

        return ResponseEntity.ok(response);
    }
    @PostMapping("/reject")
    public ResponseEntity<?> rejectRequest(
            @RequestParam Long requestId,
            @RequestParam(required = false) String doctorMessage) {

        Optional<ConsultReq> optionalReq = consultationRepo.findById(requestId);

        if (optionalReq.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Request not found");
        }

        ConsultReq req = optionalReq.get();
        req.setStatus("rejected");
        req.setDoctorMessage(doctorMessage != null ? doctorMessage : ""); // optional message
        consultationRepo.save(req);

        return ResponseEntity.ok("Request rejected with message");
    }


}

