package com.upn.observatorio.repository;

import com.upn.observatorio.model.UnidadTerritorial;
import java.util.List;

public interface UnidadTerritorialRepository {
    void replaceAll(List<UnidadTerritorial> territorios);
    List<UnidadTerritorial> findAll();
}
