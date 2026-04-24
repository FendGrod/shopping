package com.example.bshop.repository;

import com.example.bshop.model.Commande;
import com.example.bshop.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommandeRepository extends JpaRepository<Commande, Long> {
    List<Commande> findByUtilisateurOrderByDateCommandeDesc(Utilisateur utilisateur);
    List<Commande> findAllByOrderByDateCommandeDesc();
}