package com.upn.observatorio.controller;

import com.upn.observatorio.dto.ResumenEstadisticoDTO;
import com.upn.observatorio.service.EstadisticaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/estadisticas")
public class EstadisticaApiController {
    private final EstadisticaService service;
    public EstadisticaApiController(EstadisticaService service) { this.service = service; }
    @GetMapping("/resumen")
    public ResumenEstadisticoDTO resumen(
            @RequestParam String indicador, @RequestParam String departamento,
            @RequestParam(defaultValue = "2022") int desde, @RequestParam(defaultValue = "2025") int hasta) {
        return service.resumir(indicador, departamento, desde, hasta);
    }
}
