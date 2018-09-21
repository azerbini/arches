var WGS84 = new OpenLayers.Projection("EPSG:4326");
var Mercator = new OpenLayers.Projection("EPSG:900913");
//enable drag and drop of kml files onto django admin map view
django.jQuery( document ).ready(function() {
    console.log( "ready!" );
    console.log('loaded');

    var mapEl = django.jQuery('#id_geom_map')[0];

    if(mapEl) {
        mapEl.ondrop = function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
            if(evt.dataTransfer.files[0]) {
                handleFile(evt.dataTransfer.files[0]);
            }
        };
        mapEl.ondragenter = function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
        };
        mapEl.ondragover = function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
        };
    }


    var handleFile = function(file) {

        var reader = new FileReader();
        reader.onload = function (evt) {
            if (evt.error) {
                readerror();
                return;
            }

            var results = null;
            var content = evt.target.result;
            var engine;
            var formats = ['KML', 'GPX', 'OSM'];
            for (var i = 0; i < formats.length; i++) {
                 engine = new OpenLayers.Format[formats[i]]({
                     internalProjection: WGS84,
                     externalProjection: WGS84,
                     extractStyles: true
                 });
                 try {
                     results = engine.read(content);
                 } catch (e) {}
                 if (results && results.length) {
                     break;
                 }
             }
             if (!results || !results.length) {
                 readerror();
                 return;
             }

            //geodjango_geom is a global var created by the geodjango admin view
            geodjango_geom.clearFeatures()
            geodjango_geom.layers.vector.addFeatures(results);
            geodjango_geom.map.zoomToExtent(geodjango_geom.layers.vector.getDataExtent());
        };
        reader.readAsText(file);
    };

})