package com.upn.observatorio.model;

/** Registro jerárquico del catálogo UBIGEO utilizado por el prototipo. */
public record UnidadTerritorial(String ubigeo, String ubigeoPadre, String nombre,
                                String departamento, String provincia, String nivel) {
}
