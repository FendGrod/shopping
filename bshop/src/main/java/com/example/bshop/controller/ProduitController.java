package com.example.bshop.controller;

import com.example.bshop.model.Produit;
import com.example.bshop.service.ImportExcelService;
import com.example.bshop.service.ProduitService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("api/produits")
@CrossOrigin(origins = "http://localhost:4200")
public class ProduitController {

    private final ProduitService produitService;
    private final ImportExcelService importExcelService;

    public ProduitController(ProduitService produitService , ImportExcelService importExcelService) {
        this.produitService = produitService;
        this.importExcelService = importExcelService;
    }

    @PostMapping("/create")
    public Produit create(@RequestBody Produit produit) {
        return produitService.create(produit);
    }

    @GetMapping("/readall")
    public List<Produit> readAll() {
        return produitService.readAll();
    }

    @GetMapping("/read/{id}")
    public Optional<Produit> read(@PathVariable Long id) {
        return produitService.read(id);
    }

    @PutMapping("/update/{id}")
    public Produit update(@PathVariable Long id, @RequestBody Produit produit) {
        return produitService.update(id, produit);
    }

    @DeleteMapping("/delete/{id}")
    public void delete(@PathVariable Long id) {
        produitService.delete(id);
    }

    @GetMapping("/categorie/{categorie}")
    public List<Produit> findByCategorie(@PathVariable String categorie) {
        return produitService.findByCategorie(categorie);
    }

    @GetMapping("/sous-categorie/{sousCategorie}")
    public List<Produit> findBySousCategorie(@PathVariable String sousCategorie) {
        return produitService.findBySousCategorie(sousCategorie);
    }

    @GetMapping("/genre/{genre}")
    public List<Produit> findByGenre(@PathVariable String genre) {
        return produitService.findByGenre(genre);
    }

    @GetMapping("/search")
    public List<Produit> search(@RequestParam String keyword) {
        return produitService.search(keyword);
    }

    @PostMapping("/import-excel")
    public ResponseEntity<?> importExcel(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Fichier vide");
            }
            List<Produit> produits = importExcelService.importProduitsFromExcel(file);
            return ResponseEntity.ok(produits);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete-all")
    public ResponseEntity<Map<String, String>> deleteAll(@RequestBody List<Long> ids) {
        try {
            produitService.deleteAll(ids);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Produits supprimés avec succès");
            response.put("count", String.valueOf(ids.size()));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}