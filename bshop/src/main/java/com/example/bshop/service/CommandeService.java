package com.example.bshop.service;

import com.example.bshop.dto.CommandeRequestDTO;
import com.example.bshop.model.*;
import com.example.bshop.repository.CommandeRepository;
import com.example.bshop.repository.LigneCommandeRepository;
import com.example.bshop.repository.ProduitRepository;
import com.example.bshop.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class CommandeService {

    private final CommandeRepository commandeRepository;
    private final LigneCommandeRepository ligneCommandeRepository;
    private final ProduitRepository produitRepository;
    private final NotificationRepository notificationRepository;  // ← AJOUTE CETTE LIGNE

    public CommandeService(CommandeRepository commandeRepository,
                           LigneCommandeRepository ligneCommandeRepository,
                           ProduitRepository produitRepository,
                           NotificationRepository notificationRepository) {  // ← AJOUTE DANS LE CONSTRUCTEUR
        this.commandeRepository = commandeRepository;
        this.ligneCommandeRepository = ligneCommandeRepository;
        this.produitRepository = produitRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public Commande creerCommande(Utilisateur utilisateur, CommandeRequestDTO request) {

        // 1. VÉRIFICATION DU STOCK
        for (CommandeRequestDTO.PanierItemDTO item : request.getItems()) {
            Produit produit = produitRepository.findById(item.getProduitId())
                    .orElseThrow(() -> new RuntimeException("Produit non trouvé: " + item.getProduitId()));

            if (produit.getStock() < item.getQuantite()) {
                throw new RuntimeException("Stock insuffisant pour le produit: " + produit.getNom() +
                        ". Stock disponible: " + produit.getStock());
            }
        }

        // 2. Calculer le total
        double totalProduits = request.getItems().stream()
                .mapToDouble(item -> item.getPrixUnitaire() * item.getQuantite())
                .sum();

        double fraisLivraison = "DOMICILE".equals(request.getModeLivraison()) ? 2000.0 : 0.0;
        double total = totalProduits + fraisLivraison;

        // 3. Générer la référence
        String reference = "CMD" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        // 4. Créer la commande
        Commande commande = new Commande();
        commande.setReference(reference);
        commande.setUtilisateur(utilisateur);
        commande.setDateCommande(LocalDateTime.now());
        commande.setTotalProduits(totalProduits);
        commande.setFraisLivraison(fraisLivraison);
        commande.setTotal(total);
        commande.setAdresse(request.getAdresseLivraison().getAdresse());
        commande.setVille(request.getAdresseLivraison().getVille());
        commande.setCodePostal(request.getAdresseLivraison().getCodePostal());
        commande.setTelephone(request.getAdresseLivraison().getTelephone());
        commande.setModeLivraison(request.getModeLivraison());
        commande.setModePaiement(request.getModePaiement());
        commande.setStatut("EN_ATTENTE");

        Commande savedCommande = commandeRepository.save(commande);

        // 5. Créer les lignes de commande et mettre à jour le stock
        List<LigneCommande> lignes = new ArrayList<>();
        for (CommandeRequestDTO.PanierItemDTO item : request.getItems()) {
            Produit produit = produitRepository.findById(item.getProduitId())
                    .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

            int nouveauStock = produit.getStock() - item.getQuantite();
            produit.setStock(nouveauStock);
            produitRepository.save(produit);

            LigneCommande ligne = new LigneCommande();
            ligne.setCommande(savedCommande);
            ligne.setProduit(produit);
            ligne.setProduitNom(item.getProduitNom());
            ligne.setPrixUnitaire(item.getPrixUnitaire());
            ligne.setQuantite(item.getQuantite());
            ligne.setTaille(item.getTaille());
            ligne.setCouleur(item.getCouleur());

            lignes.add(ligneCommandeRepository.save(ligne));
        }

        // ⭐ 6. CRÉER LA NOTIFICATION ⭐
        Notification notif = new Notification();
        notif.setTitre("Nouvelle commande");
        notif.setMessage("Nouvelle commande #" + reference + " de " + utilisateur.getPrenom() + " " + utilisateur.getNom());
        notif.setType("COMMANDE");
        notif.setReference(reference);
        notificationRepository.save(notif);

        return savedCommande;
    }

    public List<Commande> getCommandesByUtilisateur(Utilisateur utilisateur) {
        return commandeRepository.findByUtilisateurOrderByDateCommandeDesc(utilisateur);
    }

    public List<LigneCommande> getLignesByCommandeId(Long commandeId) {
        return ligneCommandeRepository.findByCommandeId(commandeId);
    }
}