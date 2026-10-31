EJERCICIO 2 - ANALISIS DE RESULTADOS DE UNA PRUEBA DE CARGA
===========================================================

ENTREGABLE
----------
InformeResultados.docx: hallazgos, conclusiones y recomendaciones de la prueba,
incluyendo los datos del diagrama de VUs frente a peticiones por segundo.


ESTRUCTURA
----------
  Ejercicio2-analisis-resultados/
  |-- InformeResultados.docx           Informe
  |-- readme.txt                       Este archivo
  |-- data/
        |-- textSummary.txt                Transcripcion del resumen entregado
        |-- figura1_textSummary.png        Imagen del resumen (enunciado)
        |-- figura2_vus_vs_http_reqs.png   Diagrama de monitoreo (enunciado)


COMO SE HIZO EL ANALISIS
------------------------
Este ejercicio no ejecuta ninguna prueba. El analisis se hizo revisando el
resumen y el diagrama entregados. Para abrir el informe solo se necesita
Microsoft Word.

Los valores del resumen se tomaron directamente de textSummary.txt.
Los valores del diagrama se leyeron de la imagen y son aproximados.

Calculos usados:
  - Duracion:     276650 peticiones / 73,18 req/s = 3780 s, unos 63 minutos.
  - Pausa:        1,86 s de iteracion - 0,86 s de peticion = 1 s.
  - Errores 5xx:  1 + 5987 + 2 = 5990.
  - Total fallos: 5990 + 769 = 6759.
  - En la caida:  7 min x 60 s x 20 req/s = unas 8000 peticiones.

Los criterios (20 TPS, 1,5 s y 3 %) son los del Ejercicio 1, porque el
Ejercicio 2 no define criterios propios.
