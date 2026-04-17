package com.example.bshop.controller;

import com.example.bshop.model.Role;
import com.example.bshop.model.Utilisateur;
import com.example.bshop.service.UtilisateurService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UtilisateurController {
    private final UtilisateurService utilisateurService;


    public UtilisateurController(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    // create user

    @PostMapping("/create")
    public Utilisateur create(@RequestBody Utilisateur newuser){
        return utilisateurService.create(newuser);
    }

    // read all

    @GetMapping("/readall")
    public List<Utilisateur> readAll(){
        return utilisateurService.readAll();
    }

    // read

    @GetMapping("/read/{id}")
    public Optional<Utilisateur> read(@PathVariable Long id){
        return utilisateurService.read(id);
    }

    // update
    @PutMapping("/update/{id}")
    public Utilisateur update(@PathVariable Long id ,@RequestBody Utilisateur updateuser){
        return utilisateurService.update(id, updateuser);
    }

    // delete
    @DeleteMapping("/delete/{id}")
    public void delete(@PathVariable Long id){
        utilisateurService.delete(id);
    }

    // ========== RECHERCHES SPÉCIFIQUES ==========

    // 1. Trouver par email
    @GetMapping("/email/{email}")
    public Optional<Utilisateur> findByEmail(@PathVariable String email) {
        return utilisateurService.findByEmail(email);
    }

    // 2. Vérifier si email existe
    @GetMapping("/email-exists/{email}")
    public boolean existsByEmail(@PathVariable String email) {
        return utilisateurService.existsByEmail(email);
    }

    // 3. Lister par rôle
    @GetMapping("/role/{role}")
    public List<Utilisateur> findByRole(@PathVariable Role role) {
        return utilisateurService.findByRole(role);
    }

    // 4. Lister par provider
    @GetMapping("/provider/{provider}")
    public List<Utilisateur> findByProvider(@PathVariable String provider) {
        return utilisateurService.findByProvider(provider);
    }

    // 5. Compter par rôle
    @GetMapping("/count/role/{role}")
    public long countByRole(@PathVariable Role role) {
        return utilisateurService.countByRole(role);
    }

// ========== AUTHENTIFICATION ==========

    // 6. Vérifier mot de passe
    @PostMapping("/verify-password")
    public boolean verifyPassword(@RequestParam String email, @RequestParam String motDePasse) {
        return utilisateurService.verifierMotDePasse(email, motDePasse);
    }

    // 7. Connexion Google
    @PostMapping("/google-login")
    public Utilisateur googleLogin(@RequestParam String email,
                                   @RequestParam String providerId,
                                   @RequestParam String nom,
                                   @RequestParam String prenom) {
        return utilisateurService.connecterAvecGoogle(email, providerId, nom, prenom);
    }

// ========== STATISTIQUES ==========

    // 8. Nouveaux utilisateurs (X derniers jours)
    @GetMapping("/nouveaux/{jours}")
    public List<Utilisateur> getNouveauxUtilisateurs(@PathVariable int jours) {
        return utilisateurService.getNouveauxUtilisateurs(jours);
    }



}
