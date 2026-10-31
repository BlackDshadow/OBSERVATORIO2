package com.upn.observatorio.dto;

import java.math.BigDecimal;

public record SerieAnualDTO(int anio, long casos, long poblacion, BigDecimal tasaPor100000) {
}
