package com.example.demo.controller;

import com.example.demo.model.CasePost;
import com.example.demo.model.Comment;
import com.example.demo.repository.CasePostRepo;
import com.example.demo.repository.CommentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin
@RequestMapping("/case-posts")
public class CasesCtrl {
    private static final String UPLOAD_DIR = "uploads";
    @Autowired
    private CasePostRepo postRepo;

    @Autowired
    private CommentRepo commentRepo;

    @GetMapping
    public List<CasePost> getAll() {
        return postRepo.findAll();
    }
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CasePost> createPost(
            @RequestPart("post") CasePost post,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) throws IOException {

        if (file != null && !file.isEmpty()) {
            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
            String uniqueName = UUID.randomUUID() + "_" + originalFileName;

            Path uploadPath = Paths.get(UPLOAD_DIR);
            Files.createDirectories(uploadPath);

            Path filePath = uploadPath.resolve(uniqueName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            post.setFileName(originalFileName);
            post.setFileUrl("/case-posts/file/" + uniqueName);
        }

        post.setCreatedAt(java.time.LocalDateTime.now());
        return ResponseEntity.ok(postRepo.save(post));
    }

    @GetMapping("/file/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) throws IOException {
        Path filePath = Paths.get(UPLOAD_DIR).resolve(fileName).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        String contentDisposition = "attachment; filename=\"" + resource.getFilename() + "\"";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
    @PostMapping("/{postId}/like")
    public ResponseEntity<?> likePost(@PathVariable Long postId, @RequestParam Long userId) {
        CasePost post = postRepo.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (post.getLikedUserIds().contains(userId)) {
            post.setLikes(post.getLikes()-1);
            CasePost updatedPost = postRepo.save(post);
            return ResponseEntity.ok(updatedPost);
        }

        post.getLikedUserIds().add(userId);
        post.setLikes(post.getLikes() + 1);
        CasePost updatedPost = postRepo.save(post);

        return ResponseEntity.ok(updatedPost);
    }


    @PostMapping("/{postId}/comments")
    public ResponseEntity<CasePost> addComment(
            @PathVariable Long postId,
            @RequestBody Comment comment
    ) {
        CasePost post = postRepo.findById(postId).orElseThrow();
        comment.setCreatedAt(LocalDateTime.now());
        commentRepo.save(comment);
        post.getComments().add(comment);
        return ResponseEntity.ok(postRepo.save(post));
    }
}
