package com.example.demo.repository;

import com.example.demo.model.CasePost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Repository
public interface CasePostRepo extends JpaRepository<CasePost,Long> {
    @Modifying
    @Transactional
    @Query("DELETE FROM CasePost p WHERE p.createdAt < :cutoff")
    void deleteOldPosts(LocalDateTime cutoff);
}
