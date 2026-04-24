package com.example.bshop.repository;

import com.example.bshop.model.LigneCommande;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LigneCommandeRepository extends JpaRepository<LigneCommande, Long> {
    List<LigneCommande> findByCommandeId(Long commandeId);
}