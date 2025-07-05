package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Data
public class CasePost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private int patientAge;
    private String patientGender;
    private String symptoms;

    private String doctorId;
    private String doctorName;
    private String specialization;

    private LocalDateTime createdAt;
    private int likes;

    private String fileName;
    private String fileUrl;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<Comment>();
    @ElementCollection
    private Set<Long> likedUserIds = new HashSet<>();
}
