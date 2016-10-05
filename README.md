#Obras MDUYT

This project is generated with [yo angular generator](https://github.com/yeoman/generator-angular)
version 0.15.1.

## Build & development

Run `grunt` for building and `grunt serve` for preview.

## Testing

Running `grunt test` will run the unit tests with karma.

##Notas sobre documentación de USIG
[Documentación de USIG-JS](http://servicios.usig.buenosaires.gob.ar/usig-js/3.1/doc/)

[Tenes demos acá](http://servicios.usig.buenosaires.gob.ar/usig-js/3.1/demos/)

[Y Ejemplos acá:](http://servicios.usig.buenosaires.gob.ar/usig-js/3.1/ejemplos/)

Es bastante importante que incluyan los componentes desde servicios.usig.buenosaires.gob.ar en lugar de copiarlos porque de lo contrario los bug-fixes no van a impactar en forma automática.
Si querés usar Leaflet acá te paso un ejemplo de cómo cargarías la cartografía de USIG:

```javascript
usig.Layers = {
    'amba_con_transporte': {
        url: '//tiles1.usig.buenosaires.gob.ar/mapcache/tms/1.0.0/amba_con_transporte_3857@GoogleMapsCompatible/{z}/{x}/{y}.png',
        format: 'tms',
        builder: 'tms',
        baseLayer: true,
        options: {
            maxZoom: 18,
            minZoom: 9,
            attribution:'USIG (<a href="http://www.buenosaires.gob.ar" target="_blank">GCBA</a>), © <a href="http://www.openstreetmap.org/copyright/en" target="_blank">OpenStreetMap</a> (ODbL)',
            tms: true
        },
    },
}

    var map = L.map('map', {
        center: L.latLng(-34.607497, -58.443832),
        zoom: 11,
        attributionControl: false
    });

    L.tileLayer(usig.Layers.amba_con_transporte.url, usig.Layers.amba_con_transporte.options).addTo(map);
    var lezama = L.marker([-34.628913, -58.369937]).addTo(map);
    lezama.bindPopup("<h3>Palacio Lezama</h3>");
    
    $.ajax ({
        type:'GET',
        dataType:'json',
        url: URL_DEL_SERVICIO_QUE_DEVUELVE_GEOJSON,
        error: function() {
            alert('No se pudieron cargar los datos');
        },
        success: function(data) {
            L.geoJson(data, {
                onEachFeature: popup /* Funcion a definir */,
                pointToLayer: styleMarker /* Estilo (opcional) */
            }).addTo(map);
        }
    });  

```  

# Obras

Observatorio de obras 

## Probar el proyecto de manera standalone
* Clonar el proyecto
* Archivo de configuración: En /dist duplicar el archivo config.js.example con el nombre config.js.
* Instalar NodeJS: [Node Js Oficial](http://nodejs.org)
* Instalar http-server
`npm install http-server -g`
* Ir a Directorio /dist y ejecutar servidor
`cd dist`
`http-server ./`
* Abrir navegador 
Dirección: `http://localhost:8080`

## Para desarrolladores
* Archivo de configuración: En /app duplicar el archivo config.js.example con el nombre config.js.
* Correr la aplicación desde /app -> Hacer los cambios en /app y con live reloading se actualizará en http://localhost:10000
`grunt server`
* Compilar
`grunt build`

## Probar los compilados. 
* Levanta la aplicación en http://localhost:10000 desde /dist
`grunt server:dist`

## Instalar en producción
* Hacer clone y/o pull del proyecto 
* Apuntar la configuración del web server a la carpera /dist
* En /dist duplicar el archivo config.js.example con el nombre config.js.
* Navegar hacia la url

=======

Bienvenido al Repositorio de Entregas de los proyectos a la ASI, denominado GIT.
La definición de como se entrega y que documentos deben entregar se encuentra en la carpeta denominada "Instructivos-Documentos ASI" donde encontrarán un instructivo del GIT que explica el proceso y donde subir cada archivo. 
Adicionalmente se encuentran los templates de guía para completar la documentación del proyecto para avanzar con las tareas y actividades de la ASI como Documento de Arquitectura, Manual de instalación, Documento de Alcance y funcionamiento, etc.

Es obligatorio que contemplen que  el sistema operativo que deben utilizar es **RedHat 6.5**. Puede descargar la versión gratuita del mismo (Centos 6.5) desde el siguiente enlace [Descargar](https://github.com/2creatives/vagrant-centos/releases/download/v6.5.1/centos65-x86_64-20131205.box)

Recuerden que **ninguno** de los ambientes productivos cuentan con acceso a internet. Si para el correcto funcionamiento de la aplicación es necesario comunicarse con servidores externos los mismos debe enumerarse en el manual de instalación indicando dominio/puerto que debe estar habilitado justificando su uso en cada caso. 

