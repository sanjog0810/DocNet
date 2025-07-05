package com.example.demo.repository;

import com.example.demo.model.ConsultReq;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultReqRepo extends JpaRepository<ConsultReq,Long> {
    List<ConsultReq> findByPatientId(Long patientId);
    List<ConsultReq> findByDoctorId(Long doctorId);
    List<ConsultReq> findByDoctorIdAndStatusNot(Long doctorId, String status);

}
