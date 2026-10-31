package com.upn.observatorio.model;

/** Unidad territorial identificada mediante el código UBIGEO.
 * El catálogo web completa provincias y distritos; el repositorio de demostración
 * contiene agregados por departamento mientras no se conecte SQL Server.
 */
public record Territorio(long id, String ubigeo, String departamento, String provincia, String distrito, String nivel) {
}
