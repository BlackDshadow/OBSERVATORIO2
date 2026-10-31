package com.upn.observatorio.repository.memory;

import com.upn.observatorio.model.UnidadTerritorial;
import com.upn.observatorio.repository.UnidadTerritorialRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public class UnidadTerritorialMemoriaRepository implements UnidadTerritorialRepository {
    private volatile List<UnidadTerritorial> datos = List.of();
    @Override public void replaceAll(List<UnidadTerritorial> territorios) { datos = List.copyOf(territorios); }
    @Override public List<UnidadTerritorial> findAll() { return datos; }
}
