EJERCICIO 1 - PRUEBA DE CARGA DEL SERVICIO DE LOGIN (k6)
========================================================

OBJETIVO
--------
Validar que el servicio POST https://fakestoreapi.com/auth/login sostenga al
menos 20 TPS cumpliendo:
  - Tiempo de respuesta maximo: 1,5 s (se valida con el percentil 95 y se
    reporta tambien el maximo).
  - Tasa de error menor al 3 % del total de peticiones.

Los usuarios (user,passwd) se parametrizan desde data/users.csv.


VERSIONES UTILIZADAS
--------------------
  - k6 ............ v2.3.0 (go1.26.8, windows/amd64)
  - Sistema ....... Windows 11 Pro
  - Shell ......... PowerShell / Git Bash
  - Git ........... 2.55.0 (solo para clonar el repositorio)
  - Conexion a Internet (obligatoria): el script importa dos librerias desde
    https://jslib.k6.io (papaparse 5.1.1 y k6-summary 0.0.2) y la prueba
    consume https://fakestoreapi.com.

El dashboard HTML (K6_WEB_DASHBOARD) viene integrado en k6 desde la v0.49,
no requiere extensiones.


ESTRUCTURA
----------
  Ejercicio1-k6-login/
  |-- data/users.csv           Datos de entrada (user,passwd)
  |-- scripts/login-test.js    Script de la prueba
  |-- reports/
  |     |-- dashboard.html     Dashboard interactivo de la ejecucion
  |     |-- summary.json       Resumen completo de metricas (JSON)
  |     |-- textSummary.txt    Resumen de consola en texto
  |-- readme.txt               Este archivo
  |-- conclusiones.txt         Hallazgos y conclusiones


PASO A PASO
-----------
1. Instalar k6 (si no esta instalado). En Windows:
       winget install k6
   Otras plataformas: https://grafana.com/docs/k6/latest/set-up/install-k6/

2. Verificar la instalacion:
       k6 version
   Debe mostrar v2.3.0 (o una version compatible).

3. Clonar el repositorio y entrar a la carpeta del ejercicio. IMPORTANTE:
   el script usa rutas relativas, por lo que debe ejecutarse desde
   Ejercicio1-k6-login.
       git clone <URL-del-repositorio>
       cd <repositorio>/Ejercicio1-k6-login

4. Ejecutar la prueba (resumen en consola + reports/summary.json y
   reports/textSummary.txt):
       k6 run scripts/login-test.js

5. Ejecutar la prueba generando ademas el dashboard HTML.
   PowerShell:
       $env:K6_WEB_DASHBOARD="true"
       $env:K6_WEB_DASHBOARD_EXPORT="reports/dashboard.html"
       k6 run scripts/login-test.js
   Git Bash / Linux / macOS:
       K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=reports/dashboard.html \
         k6 run scripts/login-test.js

6. Abrir reports/dashboard.html en el navegador y revisar
   reports/textSummary.txt.

La prueba dura 3 min 30 s. Si termina con codigo de salida 0 todos los
thresholds se cumplieron; con codigo 99 alguno fallo.


PARAMETROS OPCIONALES (variables de entorno)
--------------------------------------------
  BASE_URL    URL base del servicio.          Defecto: https://fakestoreapi.com
  TARGET_TPS  TPS objetivo en estado estable. Defecto: 25
  THINK_TIME  Pausa por iteracion (segundos). Defecto: 0.1

Ejemplo (PowerShell):
       $env:TARGET_TPS="30"; k6 run scripts/login-test.js
Ejemplo (opcion -e, valido en cualquier shell):
       k6 run -e TARGET_TPS=30 scripts/login-test.js


ESCENARIO DE CARGA
------------------
Executor ramping-arrival-rate (modelo abierto): k6 inicia las iteraciones a la
tasa indicada sin importar lo que tarde el servidor. Cada iteracion hace una
peticion, por lo que iteraciones/s = TPS.

  Etapa              Duracion   TPS
  Calentamiento      30 s       5  -> 10
  Rampa              30 s       10 -> 25
  Estado estable     2 min      25
  Bajada             30 s       25 -> 0

El objetivo es 25 TPS (25 % por encima del minimo de 20 TPS) para tener
margen. Se preasignan 60 VUs (maximo 200); segun la ley de Little hacen falta
unos 12-15.


DATOS DE ENTRADA
----------------
data/users.csv se carga una sola vez con SharedArray (memoria compartida entre
VUs). Cada iteracion toma la fila (__VU + __ITER) % total_filas y mapea las
columnas del CSV a los campos de la API:
    user   -> username
    passwd -> password


VALIDACIONES (thresholds y checks)
----------------------------------
  http_req_duration  p(95) < 1500 ms    Tiempo de respuesta
  http_req_failed    rate < 0.03        Tasa de error menor al 3 %
  checks             rate > 0.97        Status 201 y presencia de "token"

El tiempo maximo se reporta en el resumen (columna max) y se comenta en
conclusiones.txt.


INTERPRETACION DE LOS RESULTADOS
--------------------------------
  - Las metricas http_reqs e iterations muestran la tasa MEDIA de toda la
    prueba, incluidas las rampas de subida y bajada. Por eso el valor
    reportado es menor que el TPS en estado estable (ver conclusiones.txt).
  - En el dashboard, la grafica de tasa de peticiones (http_reqs) muestra el
    TPS segundo a segundo y permite ver el tramo estable.
