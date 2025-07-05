package com.example.demo.controller;

import com.example.demo.model.DonationRequest;
import com.example.demo.repository.DonationRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.http.ResponseEntity.status;

@RestController
@CrossOrigin
public class DonationCtrl {
    @Autowired
    private DonationRepo donationRepo;

    @GetMapping("/donation")
    public ResponseEntity<List<DonationRequest>> getAll(){
        List<DonationRequest> all = donationRepo.findAll();

        all.sort((a, b) -> {
            int priorityA = getUrgencyValue(a.getUrgency());
            int priorityB = getUrgencyValue(b.getUrgency());
            return Integer.compare(priorityA, priorityB); // lower value = higher priority
        });

        return ResponseEntity.ok(all);
    }

    private int getUrgencyValue(String urgency) {
        return switch (urgency.toLowerCase()) {
            case "high" -> 1;
            case "medium" -> 2;
            case "low" -> 3;
            default -> 4;
        };
    }

    @PostMapping("/donation")
    public ResponseEntity<?> create(@RequestBody DonationRequest request){
        request.setCreatedAt(LocalDateTime.now());
        String number = request.getContactPhone();
        List<DonationRequest> donationRequests = donationRepo.findByContactPhone(number);
        for(DonationRequest req : donationRequests){
            if((req.getBloodType()!=null && req.getBloodType().equals(request.getBloodType()) ) || (req.getOrganType()!=null && req.getOrganType().equals(request.getOrganType())) ){
                if(req.getPatientName().equals(request.getPatientName())){
                    return ResponseEntity.status(HttpStatus.CONFLICT).body("Request already posted for this patient.");
                }
            }
        }
        return ResponseEntity.ok(donationRepo.save(request));
    }
    @GetMapping("/user/{email}")
    public ResponseEntity<List<DonationRequest>> getRequestsByUser(@PathVariable String email) {
        List<DonationRequest> userRequests = donationRepo.findByCreatedBy(email);
        return ResponseEntity.ok(userRequests);
    }
    @DeleteMapping("/donation/{id}")
    public ResponseEntity<String> deletePost(@PathVariable String id) {
        try {
            Long donationId = Long.parseLong(id);
            if (donationRepo.existsById(donationId)) {
                donationRepo.deleteById(donationId);
                return ResponseEntity.ok("Donation request deleted successfully.");
            } else {
                return ResponseEntity.status(404).body("Donation request not found.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting donation request: " + e.getMessage());
        }
    }
    @PostMapping("/donation/update")
    public ResponseEntity<String> updatePost(@RequestBody DonationRequest donationRequest) {
        try {
            if (donationRequest.getId() == null || !donationRepo.existsById(donationRequest.getId())) {
                return ResponseEntity.badRequest().body("Invalid donation request ID.");
            }

            donationRepo.save(donationRequest);
            return ResponseEntity.ok("Donation post updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating donation post: " + e.getMessage());
        }
    }






}
