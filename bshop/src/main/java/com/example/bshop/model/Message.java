package com.example.bshop.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "message")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "utilisateur_id")
    private Utilisateur utilisateur;

    private String nom;
    private String email;
    private String sujet;
    @Column(length = 2000)
    private String contenu;
    private String reponse;
    private boolean estRepondu = false;
    private LocalDateTime dateEnvoi;
    private LocalDateTime dateReponse;

    @PrePersist
    protected void onCreate() {
        dateEnvoi = LocalDateTime.now();
    }
}