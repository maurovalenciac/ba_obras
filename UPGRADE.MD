# Actualización

## Web
Cuando la actualización solicitada es para implementar nuevas versiones del código fuente de al app:

1. Ubicarse en la carpeta raíz del proyecto, dentro del servidor y ejecutar el pull al tag de la versión indicada.
2. Testear el correcto funcionamiento de todo ingresando a la URL creada, deberían verse unos botones amarillos y poder renderizar las páginas de ejemplo para ser luego embebidas.
3. Con esto se considera concluída la actualización del código fuente.

## Archivo de Configuración
Cuando se solicita algún cambio en el archivo de configuración:

1. Está en formato javascript.
2. Ubicarse en la carpeta raíz del proyecto, dentro del servidor. Allíd Dentro de la carpeta 'dist': existe `config.js`.
3. Modificar este archiv archivo con los datos correspondientes, de acuerdo a lo solicitado:
  3. BASE_URL: será la url del conector de la API ( utilizar `https://compromisos-csv.buenosaires.gob.ar/` ).
  3. HOME_CSV: url absoluta del archivo csv que alimenta la home, el buscador y las internas. (Si no se tiene aún, dejar los de ejemplo). 
  3. MAPAS_CSV: url absoluta del archivo csv que alimenta la sección de exploración de mapas. (Si no se tiene aún, dejar los de ejemplo). 

4. Testear el correcto funcionamiento de todo ingresando a la URL creada, deberían verse unos botones amarillos y poder renderizar las páginas de ejemplo para ser luego embebidas.

5. Con esto se considera concluída la actualización del archivo.

