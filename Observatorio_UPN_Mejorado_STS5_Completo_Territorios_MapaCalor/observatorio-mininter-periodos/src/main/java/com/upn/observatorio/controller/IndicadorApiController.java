package com.upn.observatorio.controller;

import com.upn.observatorio.dto.IndicadorDTO;
import com.upn.observatorio.service.IndicadorService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/v1/indicadores")
public class IndicadorApiController {
    private final IndicadorService service;
    public IndicadorApiController(IndicadorService service) { this.service = service; }
    @GetMapping public List<IndicadorDTO> listar() { return service.listar(); }
}
