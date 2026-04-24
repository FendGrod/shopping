package com.example.bshop.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "commande")
public class Commande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String reference; // CMD-2026-001

    @ManyToOne
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @Column(nullable = false)
    private LocalDateTime dateCommande;

    @Column(nullable = false)
    private Double totalProduits;

    private Double fraisLivraison;

    @Column(nullable = false)
    private Double total;

    @Column(nullable = false)
    private String adresse;

    @Column(nullable = false)
    private String ville;

    private String codePostal;

    @Column(nullable = false)
    private String telephone;

    @Column(nullable = false)
    private String modeLivraison; // DOMICILE, POINT_RELAIS

    @Column(nullable = false)
    private String modePaiement; // LIVRAISON, ORANGE_MONEY, WAVE

    @Column(nullable = false)
    private String statut; // EN_ATTENTE, CONFIRMEE, EXPEDIEE, LIVREE, ANNULEE

    private String referencePaiement;

    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonIgnore
    private List<LigneCommande> lignes = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        dateCommande = LocalDateTime.now();
        statut = "EN_ATTENTE";
    }
}