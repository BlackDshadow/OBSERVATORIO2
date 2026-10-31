package com.upn.observatorio.service;

import com.upn.observatorio.dto.TerritorioDTO;
import com.upn.observatorio.repository.TerritorioRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TerritorioService {
    private final TerritorioRepository repository;
    public TerritorioService(TerritorioRepository repository) { this.repository = repository; }
    public List<TerritorioDTO> listarDepartamentos() {
        return repository.findAll().stream()
            .map(t -> new TerritorioDTO(t.ubigeo(), t.departamento(), t.provincia(), t.distrito(), t.nivel()))
            .toList();
    }
}
