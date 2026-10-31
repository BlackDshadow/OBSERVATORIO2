package com.upn.observatorio.repository;

import com.upn.observatorio.model.Territorio;
import java.util.List;
import java.util.Optional;

public interface TerritorioRepository {
    List<Territorio> findAll();
    Optional<Territorio> findById(long id);
    Optional<Territorio> findByDepartamento(String departamento);
}
