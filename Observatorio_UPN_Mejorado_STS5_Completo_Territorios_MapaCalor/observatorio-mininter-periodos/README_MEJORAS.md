# Observatorio de Seguridad Ciudadana — Proyecto académico UPN

## Cambios de esta versión
- La pantalla inicial permite elegir el perfil **Ciudadano** o **Investigador**.
- Ciudadano accede a una consulta guiada con filtros básicos.
- Investigador conserva la consulta avanzada, comparación, mapa y descarga CSV.
- Se conserva el prototipo multipágina Spring Boot + Thymeleaf.
- Se mantienen el cambio de tamaño de texto, alto contraste, navegación por teclado, foco visible y regiones activas.
- La comparación y la tabla del mapa incluyen tasas demostrativas por 100 000 habitantes calculadas con denominadores poblacionales ficticios.
- Se declara expresamente que no es un portal oficial y que los valores son simulados.

## Límites que deben mantenerse claros
- La interfaz carga el catálogo UBIGEO con departamentos, provincias y distritos; necesita conexión a Internet para obtener los archivos JSON de UBIGEO 2026.
- El mapa incorpora una capa de calor y una capa de marcadores. No incluye polígonos distritales/coroplético: los puntos de calor son generados artificialmente alrededor de capitales departamentales y no son ubicaciones reales.
- Las tasas de esta demo usan poblaciones ficticias y sirven únicamente para probar el cálculo y la interfaz. No son tasas reales ni comparaciones oficiales.
- Todavía no existe conexión a SQL Server. La interfaz calcula los valores estadísticos sintéticos en JavaScript. El catálogo territorial completo se envía al repositorio en memoria del backend cuando la descarga del UBIGEO termina correctamente.
- La accesibilidad debe validarse con teclado, zoom, lector de pantalla y participantes; no se declara conformidad WCAG completa sin auditoría.

## Importar y ejecutar en Spring Tools 5
1. Conserva una copia de tu proyecto original.
2. Descomprime este ZIP.
3. En STS: File > Import > Maven > Existing Maven Projects.
4. Selecciona la carpeta que contiene `pom.xml`.
5. Ejecuta con Run As > Spring Boot App.
6. Abre `http://localhost:8080`.

## Perfiles
- `/` pantalla de bienvenida.
- `/ciudadano` abre la consulta guiada.
- `/investigador` abre la consulta avanzada.
- `/indicadores`, `/resultados`, `/comparaciones`, `/mapa` y `/ayuda` son las pantallas funcionales existentes.

La selección de perfil se conserva en el navegador para mantener la navegación coherente. Los datos de consulta se guardan solo en `sessionStorage` para el flujo de demostración.

## SQL Server
El archivo `database/observatorio_schema.sql` contiene un esquema inicial para crear la base `ObservatorioUPN` y sus tablas: Territorio, Indicador, Poblacion, Fuente y RegistroEstadistico. Incluye una vista para calcular tasas por cada 100 000 habitantes.

Este script está preparado, pero **no se ejecuta automáticamente** y la aplicación todavía no está conectada a SQL Server. Primero debemos confirmar que el motor de SQL Server esté instalado y que puedas conectarte desde SSMS. SSMS por sí solo no incluye el motor.

## Fórmulas
- Tasa promedio anual por 100 000 habitantes = (casos acumulados del periodo / (población simulada × cantidad de años)) × 100 000.
- Variación porcentual interanual = ((valor actual − valor anterior) / valor anterior) × 100. Si el valor anterior es cero, se debe mostrar “No calculable” y no dividir entre cero.

## Próxima integración
La arquitectura por capas ya está incorporada bajo `com.upn.observatorio`: `model`, `repository` (interfaces y adaptadores `memory`), `service`, `dto`, `controller` y `config`. Por ahora los repositorios usan datos ficticios en memoria. Cuando se resuelva la autenticación de Windows, se incorporará el adaptador SQL Server sin cambiar la responsabilidad de los servicios ni los DTO. No utilizar la cuenta administrativa `sa` como credencial de la aplicación.


## Estructura Java incorporada
```text
src/main/java/com/upn/observatorio/
├── ObservatorioMininterApplication.java
├── model/
│   ├── Indicador.java
│   ├── Territorio.java
│   ├── UnidadTerritorial.java
│   ├── Poblacion.java
│   └── RegistroEstadistico.java
├── repository/
│   ├── IndicadorRepository.java
│   ├── TerritorioRepository.java
│   ├── UnidadTerritorialRepository.java
│   ├── PoblacionRepository.java
│   ├── RegistroEstadisticoRepository.java
│   └── memory/
├── service/
│   ├── IndicadorService.java
│   ├── EstadisticaService.java
│   ├── TerritorioService.java
│   └── CatalogoTerritorialService.java
├── dto/
│   ├── IndicadorDTO.java
│   ├── SerieAnualDTO.java
│   └── ResumenEstadisticoDTO.java
├── controller/
│   ├── InicioController.java
│   ├── IndicadorApiController.java
│   ├── EstadisticaApiController.java
│   ├── TerritorioApiController.java
│   └── CatalogoTerritorialApiController.java
└── config/
    ├── DatosDemostracion.java
    └── DatosDemostracionConfig.java
```

## API REST de demostración
- `GET /api/v1/indicadores`: lista los indicadores disponibles.
- `GET /api/v1/estadisticas/resumen?indicador=ROBOS&departamento=Lima&desde=2022&hasta=2025`: devuelve casos, población, tasas anuales y una tasa promedio del periodo.
- `GET /api/v1/territorios/departamentos`: lista los 25 ámbitos departamentales de demostración.
- `POST /api/v1/territorios/catalogo`: recibe y guarda temporalmente en memoria el catálogo UBIGEO completo que descarga el navegador.
- `GET /api/v1/territorios/catalogo`: consulta el catálogo cargado en memoria; si reinicias Spring Boot, el navegador lo vuelve a enviar al abrir una pantalla de consulta o mapa.

Estos endpoints usan datos inventados. La tasa promedio expuesta por la API se calcula como casos acumulados divididos entre la suma de las poblaciones anuales, multiplicado por 100 000; la serie incluye además la tasa específica de cada año.


## Catálogo territorial completo y mapa de calor (actualización)

- El selector territorial carga departamentos, provincias y distritos del catálogo UBIGEO 2026 desde el repositorio público `RitchieRD/ubigeos-peru-data` (archivos JSON, licencia CC0). Se utilizan códigos UBIGEO como identificadores territoriales.
- Se espera un catálogo de 25 ámbitos departamentales (incluye Callao), 196 provincias y 1 893 distritos. El número incluye los registros territoriales del conjunto UBIGEO 2026; revisa su fuente antes de usarlo como catálogo institucional definitivo.
- Hace falta conexión a Internet para descargar el catálogo y los recursos cartográficos (Leaflet, Leaflet.heat y OpenStreetMap). Si no se puede descargar, la aplicación muestra un aviso y utiliza un pequeño catálogo de respaldo.
- El mapa dispone de capas alternables: mapa de calor y marcadores. Los valores de casos, denominadores poblacionales e intensidades son simulados. Los puntos de calor se generan alrededor de capitales departamentales con desplazamientos artificiales; no son denuncias, coordenadas de delitos ni focos reales.
- El catálogo completo se utiliza para los filtros del navegador. La API Java `/api/v1/territorios/departamentos` expone los 25 agregados departamentales de demostración. La conexión de los 1 893 distritos a SQL Server queda preparada en el esquema relacional, pero no está activa hasta que se configure la conexión y se importe el catálogo.
- El catálogo de nombres y UBIGEO procede de `https://github.com/RitchieRD/ubigeos-peru-data` (CC0). No se incluyen estadísticas delictivas reales.
