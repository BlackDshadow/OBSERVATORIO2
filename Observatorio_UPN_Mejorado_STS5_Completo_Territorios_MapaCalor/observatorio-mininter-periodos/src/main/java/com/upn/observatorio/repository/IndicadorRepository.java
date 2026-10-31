package com.upn.observatorio.repository;

import com.upn.observatorio.model.Indicador;
import java.util.List;
import java.util.Optional;

public interface IndicadorRepository {
    List<Indicador> findAll();
    Optional<Indicador> findByCodigo(String codigo);
}
