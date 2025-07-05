package com.example.demo.repository;

import com.example.demo.model.DonationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationRepo extends JpaRepository<DonationRequest,Long> {
    List<DonationRequest> findByContactPhone(String contactPhone);
    List<DonationRequest> findByCreatedBy(String email);

}
