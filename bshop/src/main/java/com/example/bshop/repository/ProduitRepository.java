package com.example.bshop.repository;

import com.example.bshop.model.Produit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProduitRepository extends JpaRepository<Produit, Long> {
    List<Produit> findByCategorie(String categorie);
    List<Produit> findBySousCategorie(String sousCategorie);
    List<Produit> findByGenre(String genre);

    @Query("SELECT p FROM Produit p WHERE " +
            "LOWER(p.nom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Produit> searchByKeyword(@Param("keyword") String keyword);
}
