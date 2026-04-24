package com.example.bshop.repository;

import com.example.bshop.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository< Notification , Long> {
    List<Notification> findByIsLuFalseOrderByDateCreationDesc();
    List<Notification> findAllByOrderByDateCreationDesc();
}
