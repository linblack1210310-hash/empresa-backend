package com.angarita.empresa.repository;

import com.angarita.empresa.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByUsername(String username);

    Optional<Usuario> findByUsername(String username);

    boolean existsByEmail(String email);
}