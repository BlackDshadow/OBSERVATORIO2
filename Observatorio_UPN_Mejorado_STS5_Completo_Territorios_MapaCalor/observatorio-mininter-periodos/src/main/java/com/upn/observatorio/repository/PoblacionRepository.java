package com.upn.observatorio.repository;

import com.upn.observatorio.model.Poblacion;
import java.util.Optional;

public interface PoblacionRepository {
    Optional<Poblacion> findByTerritorioIdAndAnio(long territorioId, int anio);
}
