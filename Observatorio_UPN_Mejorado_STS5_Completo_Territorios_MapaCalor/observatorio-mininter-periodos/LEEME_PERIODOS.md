# Nueva función: filtro de periodos (2022–2025)

Se conserva el diseño y las funciones anteriores. En **Consultar indicadores**, **Comparaciones** y **Mapa**, elige «Un año» o «Rango de años».

- Un año: muestra únicamente el valor de ese año en Resultados.
- Rango: muestra la serie completa del intervalo elegido (ambos extremos incluidos).
- En Mapa y Comparaciones, el valor mostrado para un rango es la **suma acumulada** de los años elegidos.
- La exportación CSV incluye únicamente los años seleccionados y el periodo en metadatos.
- Si el año inicial supera al final, aparece una advertencia y se bloquea la operación.
- Los datos siguen siendo completamente ficticios. No hay conexión SQL.

## Instalación
Detén Spring Boot. Haz una copia del proyecto anterior y reemplaza `src/main/resources/static/js/app.js`, `src/main/resources/static/css/estilos.css` y las plantillas `indicadores.html`, `resultados.html`, `comparaciones.html`, `mapa.html` con los archivos de este proyecto. Alternativamente, importa el proyecto Maven completo en otro workspace. Reinicia Spring Boot y actualiza Chrome con Ctrl+F5.

## Pruebas
1. Consulta: Robos, Lima, Lima, Chorrillos, rango 2022–2024; Resultados debe mostrar solo tres años.
2. Cambia de líneas a barras; la tabla debe permanecer igual.
3. Descarga CSV: debe contener solo 2022, 2023 y 2024.
4. En Mapa selecciona 2022–2024 y verifica el texto «acumulados».
5. En Comparaciones selecciona 2022–2024 y compara Lima con Arequipa.
6. Prueba 2025–2022: debe mostrar el mensaje de error.
