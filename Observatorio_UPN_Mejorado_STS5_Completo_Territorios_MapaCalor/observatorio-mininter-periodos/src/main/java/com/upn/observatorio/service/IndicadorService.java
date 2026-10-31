package com.upn.observatorio.service;

import com.upn.observatorio.dto.IndicadorDTO;
import com.upn.observatorio.repository.IndicadorRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class IndicadorService {
    private final IndicadorRepository repository;
    public IndicadorService(IndicadorRepository repository) { this.repository = repository; }
    public List<IndicadorDTO> listar() {
        return repository.findAll().stream()
            .map(i -> new IndicadorDTO(i.codigo(), i.nombre(), i.definicion(), i.unidad())).toList();
    }
}
