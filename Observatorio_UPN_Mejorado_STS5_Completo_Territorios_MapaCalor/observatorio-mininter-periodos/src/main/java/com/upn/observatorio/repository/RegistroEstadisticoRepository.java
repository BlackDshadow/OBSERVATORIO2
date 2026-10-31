package com.upn.observatorio.repository;

import com.upn.observatorio.model.RegistroEstadistico;
import java.util.List;

public interface RegistroEstadisticoRepository {
    List<RegistroEstadistico> findByIndicadorDepartamentoYPeriodo(
            String codigoIndicador, String departamento, int desde, int hasta);
}
