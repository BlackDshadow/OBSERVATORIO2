package com.upn.observatorio.model;

/** Denominador poblacional asociado a un territorio y año. */
public record Poblacion(long territorioId, int anio, long habitantes, boolean datoSimulado) {
}
