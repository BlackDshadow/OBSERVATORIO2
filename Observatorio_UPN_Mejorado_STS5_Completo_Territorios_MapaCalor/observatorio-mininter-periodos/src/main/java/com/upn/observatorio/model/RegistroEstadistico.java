package com.upn.observatorio.model;

/** Registro anual de casos para un indicador y territorio. */
public record RegistroEstadistico(long id, String codigoIndicador, long territorioId, int anio,
                                  long cantidad, boolean datoSimulado) {
}
