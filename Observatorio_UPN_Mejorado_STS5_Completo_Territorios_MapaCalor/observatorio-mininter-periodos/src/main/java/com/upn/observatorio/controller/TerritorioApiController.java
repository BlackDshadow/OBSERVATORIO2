package com.upn.observatorio.controller;

import com.upn.observatorio.dto.TerritorioDTO;
import com.upn.observatorio.service.TerritorioService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/v1/territorios")
public class TerritorioApiController {
    private final TerritorioService service;
    public TerritorioApiController(TerritorioService service) { this.service = service; }
    @GetMapping("/departamentos")
    public List<TerritorioDTO> departamentos() { return service.listarDepartamentos(); }
}
