package com.upn.observatorio.service;

import com.upn.observatorio.dto.UnidadTerritorialDTO;
import com.upn.observatorio.model.UnidadTerritorial;
import com.upn.observatorio.repository.UnidadTerritorialRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Set;

@Service
public class CatalogoTerritorialService {
    private static final Set<String> NIVELES = Set.of("DEPARTAMENTO", "PROVINCIA", "DISTRITO");
    private final UnidadTerritorialRepository repository;

    public CatalogoTerritorialService(UnidadTerritorialRepository repository) { this.repository = repository; }

    public int reemplazar(List<UnidadTerritorialDTO> entrada) {
        if (entrada == null || entrada.isEmpty()) throw new IllegalArgumentException("El catálogo territorial está vacío.");
        List<UnidadTerritorial> normalizados = entrada.stream().map(dto -> {
            if (dto.ubigeo() == null || dto.ubigeo().isBlank() || dto.nombre() == null || dto.nombre().isBlank()
                    || dto.nivel() == null || !NIVELES.contains(dto.nivel().toUpperCase())) {
                throw new IllegalArgumentException("Cada territorio debe incluir UBIGEO, nombre y nivel válidos.");
            }
            return new UnidadTerritorial(dto.ubigeo().trim(), dto.ubigeoPadre(), dto.nombre().trim(),
                dto.departamento(), dto.provincia(), dto.nivel().toUpperCase());
        }).toList();
        repository.replaceAll(normalizados);
        return normalizados.size();
    }

    public List<UnidadTerritorialDTO> listar() {
        return repository.findAll().stream()
            .map(t -> new UnidadTerritorialDTO(t.ubigeo(), t.ubigeoPadre(), t.nombre(), t.departamento(), t.provincia(), t.nivel()))
            .toList();
    }
}
