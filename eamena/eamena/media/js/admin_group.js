var WGS84 = new OpenLayers.Projection("EPSG:4326");
var Mercator = new OpenLayers.Projection("EPSG:900913");
//enable drag and drop of kml files onto django admin map view
django.jQuery( document ).ready(function() {
    console.log( "ready!");

    var mapEl = django.jQuery('#id_geom')[0];

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


    var allfeatures = [];

    var existingfeatures = olwidget_id_geom.vectorLayers[0].features;
    for (var i =0; i < existingfeatures.length; i++){
        if (existingfeatures[i].geometry) {
            existingfeatures[i].geometry.transform(Mercator, WGS84);
            allfeatures.push(existingfeatures[i]);
        }
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

            for (var i = 0; i < results.length; i++){
                allfeatures.push(results[i]);
            }


            var options = {
                'internalProjection': new OpenLayers.Projection("EPSG:4326"),
                'externalProjection': new OpenLayers.Projection("EPSG:4326")
            };
            var wktFormat = new OpenLayers.Format.WKT(options);
            var wkttext = wktFormat.write(allfeatures);

            for (var i =0; i < olwidget_id_geom.layers.length; i++){
                if (olwidget_id_geom.layers[i].CLASS_NAME == "olwidget.EditableLayer"){
                    var mylayr = olwidget_id_geom.layers[i];
                    mylayr.clearFeatures();
                    if (mylayr.textarea.value.length > 0) {
                        mylayr.textarea.value = mylayr.textarea.value + ',' + wkttext;
                    }else{
                        mylayr.textarea.value = wkttext;
                    }
                    mylayr.readWKT();
                }
            }
            olwidget_id_geom.initCenter();

        };
        reader.readAsText(file);
    };

})