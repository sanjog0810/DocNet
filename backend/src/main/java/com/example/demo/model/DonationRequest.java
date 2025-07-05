package com.example.demo.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DonationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // "blood" or "organ"

    private String bloodType; // if type == blood

    private String organType; // if type == organ

    private String urgency;

    private String patientName;

    private String hospitalName;

    private String location;

    private String contactPhone;

    private String description;

    private LocalDateTime requiredBy;

    private LocalDateTime createdAt;

    private String createdBy; // email or username of the creator

}

