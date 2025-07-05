package com.example.demo;

import com.example.demo.repository.CasePostRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class CasePostCleanup {
    @Autowired
    private CasePostRepo casePostRepo;

    // Run once a day at 2 AM
    @Scheduled(cron = "0 0 2 * * ?")
    public void deleteOldCasePosts() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(2);
        casePostRepo.deleteOldPosts(cutoff);
    }
}
