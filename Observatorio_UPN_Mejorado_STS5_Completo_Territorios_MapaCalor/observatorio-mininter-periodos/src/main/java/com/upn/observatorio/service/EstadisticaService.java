package com.upn.observatorio.service;

import com.upn.observatorio.dto.ResumenEstadisticoDTO;
import com.upn.observatorio.dto.SerieAnualDTO;
import com.upn.observatorio.model.Indicador;
import com.upn.observatorio.model.Poblacion;
import com.upn.observatorio.model.RegistroEstadistico;
import com.upn.observatorio.model.Territorio;
import com.upn.observatorio.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class EstadisticaService {
    private final IndicadorRepository indicadorRepository;
    private final TerritorioRepository territorioRepository;
    private final RegistroEstadisticoRepository registroRepository;
    private final PoblacionRepository poblacionRepository;

    public EstadisticaService(IndicadorRepository indicadorRepository, TerritorioRepository territorioRepository,
            RegistroEstadisticoRepository registroRepository, PoblacionRepository poblacionRepository) {
        this.indicadorRepository = indicadorRepository; this.territorioRepository = territorioRepository;
        this.registroRepository = registroRepository; this.poblacionRepository = poblacionRepository;
    }

    public ResumenEstadisticoDTO resumir(String codigo, String departamento, int desde, int hasta) {
        if (desde < 2022 || hasta > 2025 || desde > hasta) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El periodo debe estar entre 2022 y 2025 y el inicio no puede superar al fin.");
        }
        Indicador indicador = indicadorRepository.findByCodigo(codigo)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontró el indicador solicitado."));
        Territorio territorio = territorioRepository.findByDepartamento(departamento)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontró el departamento solicitado."));
        List<RegistroEstadistico> registros = registroRepository.findByIndicadorDepartamentoYPeriodo(codigo, departamento, desde, hasta);
        List<SerieAnualDTO> serie = new ArrayList<>();
        long totalCasos = 0; long totalPoblacion = 0; boolean simulado = false; int cantidadAnios = 0;
        for (RegistroEstadistico registro : registros) {
            Poblacion poblacion = poblacionRepository.findByTerritorioIdAndAnio(territorio.id(), registro.anio())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falta la población para calcular la tasa."));
            BigDecimal tasa = BigDecimal.valueOf(registro.cantidad())
                .multiply(BigDecimal.valueOf(100000))
                .divide(BigDecimal.valueOf(poblacion.habitantes()), 2, RoundingMode.HALF_UP);
            serie.add(new SerieAnualDTO(registro.anio(), registro.cantidad(), poblacion.habitantes(), tasa));
            totalCasos += registro.cantidad(); totalPoblacion += poblacion.habitantes(); cantidadAnios++;
            simulado |= registro.datoSimulado() || poblacion.datoSimulado();
        }
        BigDecimal tasaPromedio = cantidadAnios == 0 ? BigDecimal.ZERO :
            BigDecimal.valueOf(totalCasos).multiply(BigDecimal.valueOf(100000))
                .divide(BigDecimal.valueOf(totalPoblacion), 2, RoundingMode.HALF_UP);
        return new ResumenEstadisticoDTO(indicador.codigo(), indicador.nombre(), departamento, desde, hasta,
            totalCasos, tasaPromedio, simulado, List.copyOf(serie));
    }
}
