package com.upn.observatorio.repository.memory;

import com.upn.observatorio.config.DatosDemostracion;
import com.upn.observatorio.model.Poblacion;
import com.upn.observatorio.repository.PoblacionRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public class PoblacionMemoriaRepository implements PoblacionRepository {
    private final DatosDemostracion datos;
    public PoblacionMemoriaRepository(DatosDemostracion datos) { this.datos = datos; }
    @Override public Optional<Poblacion> findByTerritorioIdAndAnio(long territorioId, int anio) {
        return datos.poblaciones().stream()
            .filter(p -> p.territorioId() == territorioId && p.anio() == anio).findFirst();
    }
}
