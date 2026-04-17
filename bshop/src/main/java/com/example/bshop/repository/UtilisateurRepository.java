package com.example.bshop.repository;

import com.example.bshop.model.Role;
import com.example.bshop.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long > {

    Optional<Utilisateur> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Utilisateur> findByRole(Role role);

    List<Utilisateur> findByProvider(String provider);

    long countByRole(Role role);

    List<Utilisateur> findByDateCreationAfter(LocalDateTime date);
}
