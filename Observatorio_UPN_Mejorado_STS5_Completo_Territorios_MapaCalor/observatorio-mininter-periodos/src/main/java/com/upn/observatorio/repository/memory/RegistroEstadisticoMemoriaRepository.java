package com.upn.observatorio.repository.memory;

import com.upn.observatorio.config.DatosDemostracion;
import com.upn.observatorio.model.RegistroEstadistico;
import com.upn.observatorio.repository.RegistroEstadisticoRepository;
import com.upn.observatorio.repository.TerritorioRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Repository
public class RegistroEstadisticoMemoriaRepository implements RegistroEstadisticoRepository {
    private final DatosDemostracion datos;
    private final TerritorioRepository territorioRepository;
    public RegistroEstadisticoMemoriaRepository(DatosDemostracion datos, TerritorioRepository territorioRepository) {
        this.datos = datos; this.territorioRepository = territorioRepository;
    }
    @Override public List<RegistroEstadistico> findByIndicadorDepartamentoYPeriodo(
            String codigoIndicador, String departamento, int desde, int hasta) {
        Set<Long> ids = territorioRepository.findByDepartamento(departamento)
            .map(t -> Set.of(t.id())).orElse(Set.of());
        return datos.registros().stream()
            .filter(r -> r.codigoIndicador().equalsIgnoreCase(codigoIndicador))
            .filter(r -> ids.contains(r.territorioId()))
            .filter(r -> r.anio() >= desde && r.anio() <= hasta)
            .sorted((a, b) -> Integer.compare(a.anio(), b.anio()))
            .collect(Collectors.toList());
    }
}
