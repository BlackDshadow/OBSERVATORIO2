package com.upn.observatorio.config;

import com.upn.observatorio.model.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.ArrayList;
import java.util.List;

/** Valores estadísticos sintéticos para las 25 circunscripciones departamentales.
 * No representan cifras oficiales ni deben utilizarse para decisiones reales.
 */
@Configuration
public class DatosDemostracionConfig {
    private static final String[][] DEPARTAMENTOS = {
        {"01", "Amazonas"}, {"02", "Áncash"}, {"03", "Apurímac"}, {"04", "Arequipa"},
        {"05", "Ayacucho"}, {"06", "Cajamarca"}, {"07", "Callao"}, {"08", "Cusco"},
        {"09", "Huancavelica"}, {"10", "Huánuco"}, {"11", "Ica"}, {"12", "Junín"},
        {"13", "La Libertad"}, {"14", "Lambayeque"}, {"15", "Lima"}, {"16", "Loreto"},
        {"17", "Madre de Dios"}, {"18", "Moquegua"}, {"19", "Pasco"}, {"20", "Piura"},
        {"21", "Puno"}, {"22", "San Martín"}, {"23", "Tacna"}, {"24", "Tumbes"},
        {"25", "Ucayali"}
    };

    @Bean
    public DatosDemostracion datosDemostracion() {
        List<Indicador> indicadores = List.of(
            new Indicador("DENUNCIAS", "Denuncias registradas", "Cantidad ficticia de denuncias registradas en el periodo.", "casos"),
            new Indicador("ROBOS", "Robos reportados", "Cantidad ficticia de reportes de robo en el periodo.", "casos"),
            new Indicador("HURTOS", "Hurtos reportados", "Cantidad ficticia de reportes de hurto en el periodo.", "casos")
        );
        List<Territorio> territorios = new ArrayList<>();
        List<Poblacion> poblaciones = new ArrayList<>();
        List<RegistroEstadistico> registros = new ArrayList<>();
        long registroId = 1;
        for (int d = 0; d < DEPARTAMENTOS.length; d++) {
            String ubigeo = DEPARTAMENTOS[d][0];
            String nombre = DEPARTAMENTOS[d][1];
            long territorioId = d + 1L;
            territorios.add(new Territorio(territorioId, ubigeo, nombre, null, null, "DEPARTAMENTO"));
            long base = 450_000L + (Math.abs(nombre.hashCode()) % 8_000_000L);
            long casosBase = 500L + (Math.abs((nombre + "DEMO").hashCode()) % 1_400L);
            for (int anio = 2022; anio <= 2025; anio++) {
                long poblacion = base + (anio - 2022L) * 2_500L; // población ficticia
                poblaciones.add(new Poblacion(territorioId, anio, poblacion, true));
                double crecimiento = 1.0 + (anio - 2022) * 0.055;
                registros.add(new RegistroEstadistico(registroId++, "DENUNCIAS", territorioId, anio, Math.round(casosBase * crecimiento), true));
                registros.add(new RegistroEstadistico(registroId++, "ROBOS", territorioId, anio, Math.round(casosBase * 0.41 * crecimiento), true));
                registros.add(new RegistroEstadistico(registroId++, "HURTOS", territorioId, anio, Math.round(casosBase * 0.59 * crecimiento), true));
            }
        }
        return new DatosDemostracion(indicadores, territorios, poblaciones, registros);
    }
}
