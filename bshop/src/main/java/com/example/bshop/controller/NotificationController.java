package com.example.bshop.controller;

import com.example.bshop.model.Notification;
import com.example.bshop.repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("api/notifications")
@CrossOrigin(origins = "http://localhost:4200")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/non-lues")
    public ResponseEntity<List<Notification>> getNonLues() {
        List<Notification> notifications = notificationRepository.findByIsLuFalseOrderByDateCreationDesc();
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Notification>> getAll() {
        List<Notification> notifications = notificationRepository.findAllByOrderByDateCreationDesc();
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/lue")
    public ResponseEntity<Void> marquerLue(@PathVariable Long id) {
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));
        notif.setLu(true);
        notificationRepository.save(notif);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/tout-lu")
    public ResponseEntity<Void> marquerToutLu() {
        List<Notification> nonLues = notificationRepository.findByIsLuFalseOrderByDateCreationDesc();
        for (Notification notif : nonLues) {
            notif.setLu(true);
            notificationRepository.save(notif);
        }
        return ResponseEntity.ok().build();
    }
}