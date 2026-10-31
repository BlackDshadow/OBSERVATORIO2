package com.upn.observatorio.repository.memory;

import com.upn.observatorio.config.DatosDemostracion;
import com.upn.observatorio.model.Indicador;
import com.upn.observatorio.repository.IndicadorRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public class IndicadorMemoriaRepository implements IndicadorRepository {
    private final DatosDemostracion datos;
    public IndicadorMemoriaRepository(DatosDemostracion datos) { this.datos = datos; }
    @Override public List<Indicador> findAll() { return datos.indicadores(); }
    @Override public Optional<Indicador> findByCodigo(String codigo) {
        return datos.indicadores().stream().filter(i -> i.codigo().equalsIgnoreCase(codigo)).findFirst();
    }
}
