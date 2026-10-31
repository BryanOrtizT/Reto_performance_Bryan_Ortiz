/**
 * Prueba de carga - Servicio de Login (fakestoreapi.com)
 *
 * Objetivo: validar que POST /auth/login sostenga al menos 20 TPS cumpliendo:
 *   - Tiempo de respuesta máximo 1,5 s (se valida con p95 y se reporta el max)
 *   - Tasa de error menor al 3 %
 *
 * Ejecución (desde la carpeta Ejercicio1-k6-login):
 *   k6 run scripts/login-test.js
 *
 * Con dashboard HTML (PowerShell):
 *   $env:K6_WEB_DASHBOARD="true"
 *   $env:K6_WEB_DASHBOARD_EXPORT="reports/dashboard.html"
 *   k6 run scripts/login-test.js
 *
 * Variables de entorno (opcionales):
 *   BASE_URL    (default: https://fakestoreapi.com)
 *   TARGET_TPS  (default: 25)  -> margen sobre el requisito de 20 TPS
 *   THINK_TIME  (default: 0.1) -> segundos de pausa por iteración
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

const BASE_URL = __ENV.BASE_URL || 'https://fakestoreapi.com';
const TARGET_TPS = Number(__ENV.TARGET_TPS || 25);
const THINK_TIME = Number(__ENV.THINK_TIME || 0.1);

// open() es relativo a la ubicación del script: scripts/ -> ../data/
const users = new SharedArray('users', function () {
  return papaparse.parse(open('../data/users.csv'), {
    header: true,
    skipEmptyLines: true,
  }).data;
});

export const options = {
  scenarios: {
    login_load: {
      // Modelo abierto: k6 inicia TARGET_TPS iteraciones por segundo sin
      // importar lo que tarde el servidor. Con 1 petición por iteración,
      // iteraciones/s = TPS.
      executor: 'ramping-arrival-rate',
      startRate: 5,
      timeUnit: '1s',
      // Ley de Little: VUs ≈ TPS × duración de iteración
      // 25 × (~0,5 s respuesta + 0,1 s pausa) ≈ 15 VUs. Se reservan 60 como margen.
      preAllocatedVUs: 60,
      maxVUs: 200,
      stages: [
        { target: Math.round(TARGET_TPS * 0.4), duration: '30s' }, // calentamiento
        { target: TARGET_TPS, duration: '30s' },                   // rampa hasta el objetivo
        { target: TARGET_TPS, duration: '2m' },                    // estado estable
        { target: 0, duration: '30s' },                            // rampa de bajada
      ],
    },
  },
  thresholds: {
    // Criterio de tiempo: p95 <= 1,5 s (el max se reporta en conclusiones)
    http_req_duration: ['p(95)<1500'],
    // Criterio de error: menos del 3 % de peticiones fallidas
    http_req_failed: ['rate<0.03'],
    // Validaciones de negocio (status + token)
    checks: ['rate>0.97'],
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

export default function () {
  // Elige la fila del CSV: cada VU arranca en una fila distinta y avanza una
  // por iteración; el % vuelve a 0 tras la última fila.
  const row = users[(__VU + __ITER) % users.length];

  const payload = JSON.stringify({
    username: row.user,     // el CSV usa user/passwd, la API username/password
    password: row.passwd,
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
    timeout: '60s', // igual al --max-time 60 del curl del enunciado
    tags: { name: 'POST /auth/login' },
  };

  const res = http.post(`${BASE_URL}/auth/login`, payload, params);

  // Solo validaciones de negocio. La latencia se mide aparte con
  // http_req_duration y su threshold.
  check(res, {
    'status es 201': (r) => r.status === 201,
    'respuesta contiene token': (r) => {
      try {
        return !!r.json('token');
      } catch (e) {
        return false;
      }
    },
  });

  // Think time: simula la pausa de un usuario real. Con arrival-rate no cambia
  // los TPS (los fija el executor); solo aumenta los VUs necesarios.
  sleep(THINK_TIME);
}

// Resumen en consola + archivos para el repositorio.
// Rutas relativas a la carpeta desde donde se ejecuta k6.
export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    'reports/summary.json': JSON.stringify(data, null, 2),
    'reports/textSummary.txt': textSummary(data, { indent: ' ', enableColors: false }),
  };
}
