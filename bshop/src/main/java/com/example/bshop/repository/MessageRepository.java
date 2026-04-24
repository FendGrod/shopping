package com.example.bshop.repository;

import com.example.bshop.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findAllByOrderByDateEnvoiDesc();
    List<Message> findByEstReponduFalseOrderByDateEnvoiDesc();
    List<Message> findByUtilisateurIdOrderByDateEnvoiDesc(Long utilisateurId);
}