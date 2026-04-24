package com.example.bshop.controller;

import com.example.bshop.model.Message;
import com.example.bshop.model.Utilisateur;
import com.example.bshop.repository.MessageRepository;
import com.example.bshop.repository.UtilisateurRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/messages")
@CrossOrigin(origins = "http://localhost:4200")
public class MessageController {

    private final MessageRepository messageRepository;
    private final UtilisateurRepository utilisateurRepository;

    public MessageController(MessageRepository messageRepository, UtilisateurRepository utilisateurRepository) {
        this.messageRepository = messageRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    @PostMapping("/envoyer")
    public ResponseEntity<Message> envoyerMessage(@RequestBody Map<String, String> body) {
        Message message = new Message();
        message.setNom(body.get("nom"));
        message.setEmail(body.get("email"));
        message.setSujet(body.get("sujet"));
        message.setContenu(body.get("message"));

        // Si utilisateur connecté, on associe
        if (body.containsKey("utilisateurId") && body.get("utilisateurId") != null) {
            Long userId = Long.parseLong(body.get("utilisateurId"));
            utilisateurRepository.findById(userId).ifPresent(message::setUtilisateur);
        }

        return ResponseEntity.ok(messageRepository.save(message));
    }

    @GetMapping("/non-repondus")
    public ResponseEntity<List<Message>> getNonRepondus() {
        return ResponseEntity.ok(messageRepository.findByEstReponduFalseOrderByDateEnvoiDesc());
    }

    @GetMapping("/all")
    public ResponseEntity<List<Message>> getAll() {
        return ResponseEntity.ok(messageRepository.findAllByOrderByDateEnvoiDesc());
    }

    @GetMapping("/mes-messages")
    public ResponseEntity<List<Message>> getMesMessages(@RequestHeader("userId") Long userId) {
        return ResponseEntity.ok(messageRepository.findByUtilisateurIdOrderByDateEnvoiDesc(userId));
    }

    @PutMapping("/{id}/repondre")
    public ResponseEntity<Message> repondre(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message non trouvé"));
        message.setReponse(body.get("reponse"));
        message.setEstRepondu(true);
        message.setDateReponse(LocalDateTime.now());
        return ResponseEntity.ok(messageRepository.save(message));
    }
}