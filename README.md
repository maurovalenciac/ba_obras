# obras-mduyt

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