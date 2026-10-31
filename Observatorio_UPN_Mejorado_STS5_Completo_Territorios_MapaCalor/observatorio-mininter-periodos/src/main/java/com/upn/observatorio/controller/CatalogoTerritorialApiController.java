package com.upn.observatorio.controller;

import com.upn.observatorio.dto.UnidadTerritorialDTO;
import com.upn.observatorio.service.CatalogoTerritorialService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/territorios/catalogo")
public class CatalogoTerritorialApiController {
    private final CatalogoTerritorialService service;
    public CatalogoTerritorialApiController(CatalogoTerritorialService service) { this.service = service; }

    @PostMapping
    public Map<String, Object> cargar(@RequestBody List<UnidadTerritorialDTO> catalogo) {
        try { return Map.of("mensaje", "Catálogo territorial cargado en memoria", "registros", service.reemplazar(catalogo)); }
        catch (IllegalArgumentException ex) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage()); }
    }

    @GetMapping
    public List<UnidadTerritorialDTO> listar() { return service.listar(); }
}
