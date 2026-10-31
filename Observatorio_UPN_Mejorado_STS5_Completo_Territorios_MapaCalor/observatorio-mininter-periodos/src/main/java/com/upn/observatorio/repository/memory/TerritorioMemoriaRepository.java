package com.upn.observatorio.repository.memory;

import com.upn.observatorio.config.DatosDemostracion;
import com.upn.observatorio.model.Territorio;
import com.upn.observatorio.repository.TerritorioRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public class TerritorioMemoriaRepository implements TerritorioRepository {
    private final DatosDemostracion datos;
    public TerritorioMemoriaRepository(DatosDemostracion datos) { this.datos = datos; }
    @Override public List<Territorio> findAll() { return datos.territorios(); }
    @Override public Optional<Territorio> findById(long id) {
        return datos.territorios().stream().filter(t -> t.id() == id).findFirst();
    }
    @Override public Optional<Territorio> findByDepartamento(String departamento) {
        return datos.territorios().stream().filter(t -> t.departamento().equalsIgnoreCase(departamento)).findFirst();
    }
}
