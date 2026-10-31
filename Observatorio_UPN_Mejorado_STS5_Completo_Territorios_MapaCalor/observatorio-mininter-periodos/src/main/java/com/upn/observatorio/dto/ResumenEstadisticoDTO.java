package com.upn.observatorio.dto;

import java.math.BigDecimal;
import java.util.List;

public record ResumenEstadisticoDTO(
        String indicador, String nombreIndicador, String departamento, int desde, int hasta,
        long totalCasos, BigDecimal tasaPromedioPor100000, boolean contieneDatosSimulados,
        List<SerieAnualDTO> serie) {
}
