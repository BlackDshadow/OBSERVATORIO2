package com.upn.observatorio.config;

import com.upn.observatorio.model.Indicador;
import com.upn.observatorio.model.Poblacion;
import com.upn.observatorio.model.RegistroEstadistico;
import com.upn.observatorio.model.Territorio;
import java.util.List;

/** Contenedor inmutable de datos ficticios usados mientras no exista conexión a SQL Server. */
public record DatosDemostracion(List<Indicador> indicadores, List<Territorio> territorios,
                                List<Poblacion> poblaciones, List<RegistroEstadistico> registros) {
    public DatosDemostracion {
        indicadores = List.copyOf(indicadores);
        territorios = List.copyOf(territorios);
        poblaciones = List.copyOf(poblaciones);
        registros = List.copyOf(registros);
    }
}
