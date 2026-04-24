package com.example.bshop.controller;

import com.example.bshop.dto.CommandeRequestDTO;
import com.example.bshop.model.Commande;
import com.example.bshop.model.LigneCommande;
import com.example.bshop.model.Utilisateur;
import com.example.bshop.repository.CommandeRepository;
import com.example.bshop.service.CommandeService;
import com.example.bshop.service.UtilisateurService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/commandes")
@CrossOrigin(origins = "http://localhost:4200")
public class CommandeController {

    private final CommandeService commandeService;
    private final UtilisateurService utilisateurService;
    private final CommandeRepository commandeRepository;


    public CommandeController(CommandeService commandeService, UtilisateurService utilisateurService , CommandeRepository commandeRepository) {
        this.commandeService = commandeService;
        this.utilisateurService = utilisateurService;
        this.commandeRepository = commandeRepository;

    }

    @PostMapping("/create")
    public ResponseEntity<Commande> creerCommande(@RequestBody CommandeRequestDTO request,
                                                  @RequestHeader("userId") Long userId) {
        // Récupérer l'utilisateur via l'ID passé dans le header
        Utilisateur utilisateur = utilisateurService.read(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Commande commande = commandeService.creerCommande(utilisateur, request);
        return ResponseEntity.ok(commande);
    }

    @GetMapping("/mes-commandes")
    public ResponseEntity<?> mesCommandes(@RequestHeader("userId") Long userId) {
        Utilisateur utilisateur = utilisateurService.read(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return ResponseEntity.ok(commandeService.getCommandesByUtilisateur(utilisateur));
    }

    @GetMapping("/{id}/lignes")
    public ResponseEntity<List<LigneCommande>> getLignesByCommandeId(@PathVariable Long id) {
        List<LigneCommande> lignes = commandeService.getLignesByCommandeId(id);
        return ResponseEntity.ok(lignes);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Commande>> getAllCommandes() {
        return ResponseEntity.ok(commandeRepository.findAllByOrderByDateCommandeDesc());
    }

    @PutMapping("/{id}/statut")
    public ResponseEntity<Commande> updateStatut(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Commande commande = commandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));
        commande.setStatut(body.get("statut"));
        return ResponseEntity.ok(commandeRepository.save(commande));
    }
}