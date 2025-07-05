package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.Type;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Data
public class ConsultReq {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User patient;

    @ManyToOne
    private User doctor;

    private String message;

    @JdbcTypeCode(SqlTypes.BINARY)     // forces bytea
    @Column(columnDefinition = "bytea")
    private byte[] document;

    private String fileName;
    private String fileType;

    @Column(length = 1000)
    private String doctorMessage;


    private String status = "pending"; // pending, approved, rejected

    private LocalDateTime createdAt = LocalDateTime.now();

}
