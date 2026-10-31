# Observatorio de Seguridad Ciudadana — Guía de importación y pruebas

## Importar y ejecutar
1. Descomprime el ZIP.
2. En Spring Tools 5: **File > Import > Maven > Existing Maven Projects**.
3. Selecciona la carpeta `observatorio-mininter` (la que contiene `pom.xml`).
4. Ejecuta **Run As > Spring Boot App**.
5. Abre `http://localhost:8080`.

## Recorrido por perfiles
1. En `/`, comprueba que aparecen las opciones Ciudadano e Investigador.
2. Entra como Ciudadano: la consulta muestra indicador, departamento y año; los filtros avanzados quedan ocultos.
3. Consulta datos y comprueba que se muestran resultados, gráfico, tabla y CSV.
4. Regresa al inicio y entra como Investigador.
5. Comprueba los filtros avanzados y la navegación a Comparaciones y Mapa.

## Pruebas funcionales
- Consulta robos en Lima, 2025.
- Consulta hurtos en Chorrillos, rango 2022–2024 desde el perfil investigador.
- Cambia el gráfico de líneas a barras y comprueba que la tabla conserva los mismos valores.
- Descarga CSV y verifica los metadatos y años seleccionados.
- En Comparaciones selecciona dos departamentos distintos; la tabla muestra casos, población ficticia y tasa del periodo por 100 000 habitantes.
- En Mapa comprueba que aparece el mapa de calor; cambia a Marcadores y viceversa. Selecciona un departamento, provincia y distrito y verifica el detalle y la tabla equivalente.
- Prueba un rango invertido (2025–2022): debe aparecer una advertencia y bloquear la operación.

## Pruebas de accesibilidad
- Usa Tab y Shift+Tab para recorrer todos los controles.
- Comprueba que el foco sea visible y que los botones funcionen con Enter/Espacio.
- Activa alto contraste y amplía/reduce el texto; cambia de página y verifica que las preferencias se conserven.
- Prueba zoom del navegador al 200 %.
- Verifica que las tablas tengan caption y encabezados scope.
- Revisa los anuncios de resultados con un lector de pantalla.
- Comprueba que los gráficos tengan título, descripción y tabla equivalente.

## Alcance y límites
- Se trata de un proyecto de pruebas académico UPN, no de una plataforma oficial del MININTER.
- Los valores de indicadores y las poblaciones son ficticios.
- El catálogo territorial completo carga desde UBIGEO 2026 y requiere conexión a Internet. Incluye 25 ámbitos departamentales (Callao incluido), 196 provincias y 1 893 distritos según el repositorio usado.
- El mapa incluye una capa de calor y otra de marcadores, pero sus puntos son simulados alrededor de capitales departamentales. No son incidentes ni ubicaciones reales; tampoco son polígonos distritales.
- No existe conexión a SQL Server en esta versión. La consulta y los cálculos de demostración se realizan en JavaScript.
- La accesibilidad debe validarse con personas usuarias y herramientas; no se debe declarar conformidad WCAG completa sin una auditoría.

## Base de datos
El script `database/observatorio_schema.sql` crea un esquema inicial para SQL Server. No se ejecuta automáticamente. Primero confirma que el motor SQL Server esté instalado y que SSMS pueda conectarse a él. SSMS es solo la herramienta de administración.


## Paquete Java
El paquete base es `com.upn.observatorio`. La clase principal `ObservatorioMininterApplication` está directamente dentro de ese paquete para que Spring Boot detecte automáticamente los subpaquetes (`model`, `repository`, `service`, `dto`, `controller` y `config`).

## Probar la API de demostración
Con la aplicación iniciada, abre `/api/v1/indicadores` y `/api/v1/estadisticas/resumen?indicador=ROBOS&departamento=Lima&desde=2022&hasta=2025`. Los datos devueltos son ficticios.


### Catálogo territorial y mapa de calor

Al abrir las páginas de consulta y mapa, espera el mensaje `Catálogo UBIGEO cargado`. El selector se completa en cascada: departamento → provincia → distrito. Requiere Internet para descargar los archivos JSON del catálogo UBIGEO 2026. En la pantalla Mapa puedes alternar entre `Mapa de calor` y `Marcadores`. Los datos e intensidades son simulados y no representan hechos reales.

Para comprobar la API de departamentos, abre `http://localhost:8080/api/v1/territorios/departamentos`.
