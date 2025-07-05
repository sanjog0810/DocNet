package com.example.demo.model;

import lombok.Data;

import java.util.List;
@Data
public class AIDiagnosis {
    private List<Condition> possibleConditions;
    private List<String> recommendedTests;
}
