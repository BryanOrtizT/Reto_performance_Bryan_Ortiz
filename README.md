# Reto técnico de performance

Solución de los dos ejercicios del reto:

- **Ejercicio 1:** prueba de carga del servicio de login con k6.
- **Ejercicio 2:** análisis de los resultados de una prueba de carga entregada en el enunciado.

**Autor:** Bryan Ortiz

## Estructura del repositorio

```text
.
├── README.md
├── Ejercicio1-k6-login/
│   ├── readme.txt                     Instrucciones paso a paso y versiones
│   ├── conclusiones.txt               Hallazgos y conclusiones
│   ├── data/
│   │   └── users.csv                  Usuarios de la prueba
│   ├── scripts/
│   │   └── login-test.js              Script de k6
│   └── reports/
│       ├── dashboard.html             Dashboard de la ejecución
│       ├── summary.json               Resumen completo de métricas
│       └── textSummary.txt            Resumen de la ejecución
└── Ejercicio2-analisis-resultados/
    ├── InformeResultados.docx         Hallazgos, conclusiones y recomendaciones
    ├── readme.txt                     Contenido y cálculos utilizados
    └── data/
        ├── textSummary.txt            Transcripción del resumen entregado
        ├── figura1_textSummary.png    Imagen del resumen
        └── figura2_vus_vs_http_reqs.png  Diagrama de monitoreo
```

## Versiones

| Tecnología | Versión | Uso |
|---|---|---|
| k6 | v2.3.0 | Ejecución de la prueba de carga |
| Git | 2.55.0 | Clonar el repositorio |
| Windows | 11 Pro | Sistema operativo utilizado |
| Microsoft Word | 16.0 | Abrir el informe del Ejercicio 2 |

El Ejercicio 1 necesita conexión a Internet, porque el script consume `fakestoreapi.com` e importa librerías desde `jslib.k6.io`.

## Ejercicio 1: prueba de carga del login

Se prueba `POST https://fakestoreapi.com/auth/login` con los usuarios de [users.csv](Ejercicio1-k6-login/data/users.csv).

**Criterios del enunciado:**

- Alcanzar al menos 20 TPS.
- Tiempo de respuesta de máximo 1,5 segundos.
- Tasa de error menor al 3 % del total de peticiones.

### Escenario

Se usa el executor `ramping-arrival-rate`, con 25 TPS en estado estable para dejar margen sobre el mínimo exigido.

| Etapa | Duración | TPS |
|---|---|---|
| Calentamiento | 30 s | 5 → 10 |
| Rampa de subida | 30 s | 10 → 25 |
| Estado estable | 2 min | 25 |
| Rampa de bajada | 30 s | 25 → 0 |

### Cómo ejecutarlo

1. Instalar k6. En Windows:

   ```powershell
   winget install k6
   ```

   Otras plataformas: [instalación de k6](https://grafana.com/docs/k6/latest/set-up/install-k6/).

2. Clonar el repositorio y entrar a la carpeta del ejercicio. El script usa rutas relativas, por lo que debe ejecutarse desde ahí:

   ```powershell
   git clone https://github.com/BryanOrtizT/Reto_performance_Bryan_Ortiz.git
   cd Reto_performance_Bryan_Ortiz/Ejercicio1-k6-login
   ```

3. Ejecutar la prueba, que dura 3 min 30 s:

   ```powershell
   k6 run scripts/login-test.js
   ```

4. Para generar también el dashboard HTML en PowerShell:

   ```powershell
   $env:K6_WEB_DASHBOARD="true"
   $env:K6_WEB_DASHBOARD_EXPORT="reports/dashboard.html"
   k6 run scripts/login-test.js
   ```

Los resultados quedan en `reports/`. Si k6 termina con código 0, se cumplieron todos los umbrales; con código 99, alguno falló. Las opciones adicionales están en [readme.txt](Ejercicio1-k6-login/readme.txt).

### Resultados

| Criterio | Resultado | Valoración |
|---|---|---|
| Al menos 20 TPS | 25 TPS programados en estado estable | Cumple |
| Tiempo de respuesta ≤ 1,5 s | p95 de 506 ms y máximo de 1,10 s | Cumple |
| Tasa de error < 3 % | 0,00 % (0 de 4.124 peticiones) | Cumple |

El resumen muestra 19,64 req/s porque ese valor es la media de toda la prueba e incluye las rampas de subida y bajada. La justificación está en [conclusiones.txt](Ejercicio1-k6-login/conclusiones.txt).

## Ejercicio 2: análisis de resultados

Se analizan el resumen `textSummary.txt` y el diagrama de monitoreo entregados en el enunciado. Este ejercicio no ejecuta ninguna prueba: basta con abrir el [informe](Ejercicio2-analisis-resultados/InformeResultados.docx).

Como el enunciado no define criterios para este ejercicio, se aplican los del Ejercicio 1.

### Resultados

| Criterio | Resultado | Valoración |
|---|---|---|
| Al menos 20 TPS | 73,2 req/s de media | Cumple en promedio |
| Tiempo de respuesta ≤ 1,5 s | p95 de 1,57 s y máximo de 29,93 s | No cumple |
| Tasa de error < 3 % | 2,44 % | Cumple en promedio |

**Principal hallazgo:** entre las 01:51 y las 01:58, aproximadamente, las peticiones por segundo cayeron de unas 80 a unas 10–25 con los VUs fijos en 140. Después el servicio volvió solo al nivel anterior. Esa caída no se aprecia en los promedios del resumen. Las horas y los valores del diagrama son aproximados, porque se leyeron de la imagen.

El detalle de hallazgos, conclusiones y recomendaciones está en [InformeResultados.docx](Ejercicio2-analisis-resultados/InformeResultados.docx).

## Dónde se cumple cada entregable

| Pedido en el enunciado | Dónde está |
|---|---|
| Prueba con k6 o JMeter | [login-test.js](Ejercicio1-k6-login/scripts/login-test.js) |
| Datos parametrizados desde un `.csv` | [users.csv](Ejercicio1-k6-login/data/users.csv) |
| Reportes de la ejecución | [reports/](Ejercicio1-k6-login/reports/) |
| `readme.txt` con pasos y versiones | [readme.txt](Ejercicio1-k6-login/readme.txt) |
| `conclusiones.txt` con hallazgos y conclusiones | [conclusiones.txt](Ejercicio1-k6-login/conclusiones.txt) |
| Informe con hallazgos, conclusiones y recomendaciones | [InformeResultados.docx](Ejercicio2-analisis-resultados/InformeResultados.docx) |
| Datos del diagrama de VUs y peticiones por segundo | Sección 3.4 del informe |
| Repositorio público en GitHub | [BryanOrtizT/Reto_performance_Bryan_Ortiz](https://github.com/BryanOrtizT/Reto_performance_Bryan_Ortiz) |
