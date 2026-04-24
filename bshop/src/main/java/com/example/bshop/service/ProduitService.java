package com.example.bshop.service;

import com.example.bshop.model.Produit;
import com.example.bshop.repository.ProduitRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ProduitService {

    private final ProduitRepository produitRepository;

    public ProduitService(ProduitRepository produitRepository) {
        this.produitRepository = produitRepository;
    }

    public Produit create(Produit produit) {
        // Vérifier si un produit avec le même nom existe déjà
        Optional<Produit> existing = produitRepository.findByNom(produit.getNom());
        if (existing.isPresent()) {
            throw new RuntimeException("Un produit avec le nom '" + produit.getNom() + "' existe déjà");
        }
        return produitRepository.save(produit);
    }

    public List<Produit> readAll() {
        return produitRepository.findAll();
    }

    public Optional<Produit> read(Long id) {
        return produitRepository.findById(id);
    }

    public Produit update(Long id, Produit produitModifie) {
        // Vérifier si un autre produit avec le même nom existe
        Optional<Produit> existing = produitRepository.findByNom(produitModifie.getNom());
        if (existing.isPresent() && !existing.get().getId().equals(id)) {
            throw new RuntimeException("Un produit avec le nom '" + produitModifie.getNom() + "' existe déjà");
        }

        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé : " + id));

        produit.setNom(produitModifie.getNom());
        produit.setDescription(produitModifie.getDescription());
        produit.setPrix(produitModifie.getPrix());
        produit.setPrixOriginal(produitModifie.getPrixOriginal());
        produit.setStock(produitModifie.getStock());
        produit.setImageUrl(produitModifie.getImageUrl());
        produit.setCategorie(produitModifie.getCategorie());
        produit.setSousCategorie(produitModifie.getSousCategorie());
        produit.setGenre(produitModifie.getGenre());
        produit.setRating(produitModifie.getRating());
        produit.setIsPromo(produitModifie.getIsPromo());
        produit.setIsNew(produitModifie.getIsNew());
        produit.setTailles(produitModifie.getTailles());
        produit.setCouleurs(produitModifie.getCouleurs());

        return produitRepository.save(produit);
    }

    public void delete(Long id) {
        produitRepository.deleteById(id);
    }

    // Supprimer plusieurs produits
    public void deleteAll(List<Long> ids) {
        produitRepository.deleteAllById(ids);
    }

    public List<Produit> findByCategorie(String categorie) {
        return produitRepository.findByCategorie(categorie);
    }

    public List<Produit> findBySousCategorie(String sousCategorie) {
        return produitRepository.findBySousCategorie(sousCategorie);
    }

    public List<Produit> findByGenre(String genre) {
        return produitRepository.findByGenre(genre);
    }

    public List<Produit> search(String keyword) {
        return produitRepository.searchByKeyword(keyword);
    }
}