package com.example.bshop.service;

import com.example.bshop.model.Role;
import com.example.bshop.model.Utilisateur;
import com.example.bshop.repository.UtilisateurRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;

    public UtilisateurService(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }

    // ========== CRUD DE BASE ==========

    // 1. Créer un utilisateur
    public Utilisateur create(Utilisateur newUser) {
        newUser.setDateCreation(LocalDateTime.now());
        return utilisateurRepository.save(newUser);
    }

    // 2. Lister tous les utilisateurs
    public List<Utilisateur> readAll() {
        return utilisateurRepository.findAll();
    }

    // 3. Récupérer un utilisateur par son ID
    public Optional<Utilisateur> read(Long id) {
        return utilisateurRepository.findById(id);
    }

    // 4. Modifier un utilisateur
    public Utilisateur update(Long id, Utilisateur updateUser) {
        Utilisateur userExist = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable : " + id));

        userExist.setNom(updateUser.getNom());
        userExist.setPrenom(updateUser.getPrenom());
        userExist.setEmail(updateUser.getEmail());
        userExist.setMotDePasse(updateUser.getMotDePasse());
        userExist.setTelephone(updateUser.getTelephone());
        userExist.setAdresse(updateUser.getAdresse());
        userExist.setRole(updateUser.getRole());
        userExist.setProvider(updateUser.getProvider());
        userExist.setProviderId(updateUser.getProviderId());

        return utilisateurRepository.save(userExist);
    }

    // 5. Supprimer un utilisateur
    public void delete(Long id) {
        utilisateurRepository.deleteById(id);
    }


    // ========== RECHERCHES SPÉCIFIQUES ==========

    // 6. Trouver par email
    public Optional<Utilisateur> findByEmail(String email) {
        return utilisateurRepository.findByEmail(email);
    }

    // 7. Vérifier si un email existe
    public boolean existsByEmail(String email) {
        return utilisateurRepository.existsByEmail(email);
    }

    // 8. Lister par rôle
    public List<Utilisateur> findByRole(Role role) {
        return utilisateurRepository.findByRole(role);
    }

    // 9. Lister par provider (LOCAL ou GOOGLE)
    public List<Utilisateur> findByProvider(String provider) {
        return utilisateurRepository.findByProvider(provider);
    }

    // 10. Compter par rôle
    public long countByRole(Role role) {
        return utilisateurRepository.countByRole(role);
    }

    // ========== AUTHENTIFICATION ==========

    // 11. Vérifier le mot de passe (simple pour l'instant)
    public boolean verifierMotDePasse(String email, String rawPassword) {
        Optional<Utilisateur> user = findByEmail(email);
        if (user.isPresent()) {
            // Plus tard : utiliser BCrypt
            return user.get().getMotDePasse().equals(rawPassword);
        }
        return false;
    }

    // 12. Authentifier ou créer un utilisateur Google
    public Utilisateur connecterAvecGoogle(String email, String providerId, String nom, String prenom) {
        // 1. Vérifier si l'utilisateur existe déjà
        Optional<Utilisateur> existingUser = findByEmail(email);

        if (existingUser.isPresent()) {
            // 2. S'il existe, on le retourne
            Utilisateur user = existingUser.get();
            // Mettre à jour le providerId au cas où
            if (user.getProviderId() == null) {
                user.setProviderId(providerId);
                user.setProvider("GOOGLE");
                return utilisateurRepository.save(user);
            }
            return user;
        }

        // 3. S'il n'existe pas, on crée un nouvel utilisateur
        Utilisateur newUser = new Utilisateur();
        newUser.setEmail(email);
        newUser.setNom(nom);
        newUser.setPrenom(prenom);
        newUser.setProvider("GOOGLE");
        newUser.setProviderId(providerId);
        newUser.setRole(Role.CLIENT);
        newUser.setDateCreation(LocalDateTime.now());
        newUser.setMotDePasse("");  // Pas de mot de passe pour Google

        // 4. Sauvegarder et retourner
        return utilisateurRepository.save(newUser);
    }

    // ========== STATISTIQUES ==========

    // 13. Récupérer les nouveaux utilisateurs (ex: 30 derniers jours)
    public List<Utilisateur> getNouveauxUtilisateurs(int jours) {
        LocalDateTime dateLimite = LocalDateTime.now().minusDays(jours);
        return utilisateurRepository.findByDateCreationAfter(dateLimite);
    }
}