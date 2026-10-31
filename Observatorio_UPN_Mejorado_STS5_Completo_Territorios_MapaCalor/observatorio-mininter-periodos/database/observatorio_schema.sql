/*
  Esquema inicial del proyecto académico Observatorio UPN.
  Ejecutar en SQL Server Management Studio cuando el motor esté instalado y accesible.
  No contiene estadísticas oficiales ni registros reales.
*/
IF DB_ID(N'ObservatorioUPN') IS NULL
    CREATE DATABASE ObservatorioUPN;
GO
USE ObservatorioUPN;
GO

IF OBJECT_ID('dbo.Territorio','U') IS NULL
BEGIN
    CREATE TABLE dbo.Territorio (
        territorio_id INT IDENTITY(1,1) PRIMARY KEY,
        ubigeo CHAR(6) NULL,
        territorio_padre_id INT NULL,
        departamento NVARCHAR(100) NOT NULL,
        provincia NVARCHAR(100) NULL,
        distrito NVARCHAR(100) NULL,
        nivel NVARCHAR(20) NOT NULL,
        CONSTRAINT CK_Territorio_Nivel CHECK (nivel IN ('DEPARTAMENTO','PROVINCIA','DISTRITO')),
        CONSTRAINT FK_Territorio_Padre FOREIGN KEY (territorio_padre_id) REFERENCES dbo.Territorio(territorio_id)
    );
END;
GO

-- Actualización segura si la tabla ya existía en una versión anterior del prototipo.
IF COL_LENGTH('dbo.Territorio', 'territorio_padre_id') IS NULL
BEGIN
    ALTER TABLE dbo.Territorio ADD territorio_padre_id INT NULL;
    ALTER TABLE dbo.Territorio ADD CONSTRAINT FK_Territorio_Padre
        FOREIGN KEY (territorio_padre_id) REFERENCES dbo.Territorio(territorio_id);
END;
GO

IF OBJECT_ID('dbo.Indicador','U') IS NULL
BEGIN
    CREATE TABLE dbo.Indicador (
        indicador_id INT IDENTITY(1,1) PRIMARY KEY,
        codigo NVARCHAR(40) NOT NULL UNIQUE,
        nombre NVARCHAR(160) NOT NULL,
        definicion NVARCHAR(1000) NOT NULL,
        unidad NVARCHAR(80) NOT NULL
    );
END;
GO

IF OBJECT_ID('dbo.Poblacion','U') IS NULL
BEGIN
    CREATE TABLE dbo.Poblacion (
        poblacion_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        territorio_id INT NOT NULL,
        anio SMALLINT NOT NULL,
        habitantes BIGINT NOT NULL,
        es_dato_simulado BIT NOT NULL CONSTRAINT DF_Poblacion_Simulado DEFAULT 1,
        CONSTRAINT FK_Poblacion_Territorio FOREIGN KEY (territorio_id) REFERENCES dbo.Territorio(territorio_id),
        CONSTRAINT UQ_Poblacion_Territorio_Anio UNIQUE (territorio_id, anio),
        CONSTRAINT CK_Poblacion_Habitantes CHECK (habitantes > 0)
    );
END;
GO

IF OBJECT_ID('dbo.Fuente','U') IS NULL
BEGIN
    CREATE TABLE dbo.Fuente (
        fuente_id INT IDENTITY(1,1) PRIMARY KEY,
        institucion NVARCHAR(160) NOT NULL,
        descripcion NVARCHAR(500) NOT NULL,
        fecha_actualizacion DATE NULL,
        metodologia NVARCHAR(1000) NULL,
        es_oficial BIT NOT NULL CONSTRAINT DF_Fuente_Oficial DEFAULT 0
    );
END;
GO

IF OBJECT_ID('dbo.RegistroEstadistico','U') IS NULL
BEGIN
    CREATE TABLE dbo.RegistroEstadistico (
        registro_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        indicador_id INT NOT NULL,
        territorio_id INT NOT NULL,
        fuente_id INT NULL,
        anio SMALLINT NOT NULL,
        cantidad INT NOT NULL,
        es_dato_simulado BIT NOT NULL CONSTRAINT DF_Registro_Simulado DEFAULT 1,
        CONSTRAINT FK_Registro_Indicador FOREIGN KEY (indicador_id) REFERENCES dbo.Indicador(indicador_id),
        CONSTRAINT FK_Registro_Territorio FOREIGN KEY (territorio_id) REFERENCES dbo.Territorio(territorio_id),
        CONSTRAINT FK_Registro_Fuente FOREIGN KEY (fuente_id) REFERENCES dbo.Fuente(fuente_id),
        CONSTRAINT UQ_Registro_Indicador_Territorio_Anio UNIQUE (indicador_id, territorio_id, anio),
        CONSTRAINT CK_Registro_Cantidad CHECK (cantidad >= 0),
        CONSTRAINT CK_Registro_Anio CHECK (anio BETWEEN 2022 AND 2025)
    );
END;
GO

/* Tasa por cada 100 000 habitantes. La consulta no oculta el carácter simulado. */
CREATE OR ALTER VIEW dbo.vw_TasasIndicadores AS
SELECT
    r.registro_id,
    i.codigo AS indicador,
    i.nombre AS nombre_indicador,
    t.departamento,
    t.provincia,
    t.distrito,
    r.anio,
    r.cantidad AS casos,
    p.habitantes AS poblacion,
    CAST((CAST(r.cantidad AS DECIMAL(18,4)) / NULLIF(p.habitantes,0)) * 100000 AS DECIMAL(18,2)) AS tasa_por_100000,
    CASE WHEN r.es_dato_simulado = 1 OR p.es_dato_simulado = 1 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS contiene_datos_simulados
FROM dbo.RegistroEstadistico r
INNER JOIN dbo.Indicador i ON i.indicador_id = r.indicador_id
INNER JOIN dbo.Territorio t ON t.territorio_id = r.territorio_id
INNER JOIN dbo.Poblacion p ON p.territorio_id = r.territorio_id AND p.anio = r.anio;
GO
