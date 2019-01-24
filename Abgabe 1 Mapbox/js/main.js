mapboxgl.accessToken = 'pk.eyJ1IjoiZGltYm9kdW1ibyIsImEiOiJjamplN2t4dXYxaDY2M2twOTQzMXNocjc2In0.g9BJj267dR8RBxBBgi2fyQ';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    zoom: 12,
    center: [7.6, 52],
    pitch:40
});

let globaleDate = '2018-11-03T00:00:00.000Z';

let fromDate = '2018-10-27T00:00:00.000Z'
let toDate = '2018-10-29T00:00:00.000Z'

function getData(){
    console.log(map.getBounds());
    let bbox = map.getBounds();

    let url = `https://api.opensensemap.org/statistics/descriptive
?phenomenon=Temperatur
&from-date=${fromDate}
&to-date=${toDate}
&exposure=outdoor
&operation=arithmeticMean
&format=json
&columns=lat,lon
&window=360000
&bbox=${bbox._sw.lng},${bbox._sw.lat},${bbox._ne.lng},${bbox._ne.lat}`;
    
    fetch(url)
        .then(data => data.json())
        .then(data => {
            drawData2(data);
            
        });

    url = `https://api.opensensemap.org/statistics/descriptive
?phenomenon=Beleuchtungsstärke
&from-date=${fromDate}
&to-date=${toDate}
&exposure=outdoor
&operation=arithmeticMean
&format=json
&columns=lat,lon
&window=360000
&bbox=${bbox._sw.lng},${bbox._sw.lat},${bbox._ne.lng},${bbox._ne.lat}`;
        
    fetch(url)
        .then(data => data.json())
        .then(data => {
            drawData(data);
            
        });
    

}



function drawData(data) {
    let geoJsonData = data.map(data => {
        return {
            "type": "Feature",
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                  [
                    [data.lon-0.001, data.lat-0.001],
                    [data.lon+0.001, data.lat-0.001],
                    [data.lon+0.001, data.lat+0.001],
                    [data.lon-0.001, data.lat+0.001],
                  ]
              ]
            },
            "properties": data
          }
    })

    let geoJson = {
        "type" : "FeatureCollection",
        "features" : geoJsonData
    }


    map.addSource('lux', {
        type: 'geojson',
        data: geoJson,
    })

    map.addLayer({
        id: 'luxLayer',
        source: 'lux',
        type: 'fill-extrusion',
        paint: {
            'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                ['get', fromDate],
                0, '#3d3d3d',
                25, '#4f4100',
                50, '#7a6400',
                100, '#937900',
                500, '#c19f00',
                1000, '#ffd100',
                10000, '#ffe260',
                32000, '#fff6ce'
            ],
            'fill-extrusion-height':
                ['get', fromDate],
            'fill-extrusion-height-transition': {
                duration: 10,
                delay: 0
            },
        }
    })

    var slider = document.getElementById('rangeSlider');

    slider.setAttribute('min', new Date(fromDate).getTime());
    slider.setAttribute('max', new Date(toDate).getTime());
}

function drawData2(data) {
    console.log(data);

    let geoJsonData = data.map(data => {
        return {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [data.lon, data.lat]
            },
            "properties": data
          }
    })

    let geoJson = {
        "type" : "FeatureCollection",
        "features" : geoJsonData
    }

    map.addSource('temp', {
        type: 'geojson',
        data: geoJson
    })

    map.addLayer({
        id: 'tempLayer',
        source: 'temp',
        type: 'circle',
        paint: {
            'circle-radius':  {stops: [[8, 4], [11, 6], [16, 40]]},
            'circle-color': [
                'interpolate',
                ['linear'],
                ['get', fromDate],
                0, '#ccffff',
                7, 'blue',
                15, '#3399ff',
                20, 'Aqua',
                25, 'yellow',
                30, '#ff9933',
                35, 'red'
            ]
        }
    })
}


function changeData(date) {

    let dateObj = new Date(parseInt(date));

    globalDate = dateObj.toISOString();
    document.getElementById('dateString').innerHTML = dateObj.toLocaleString();
    map.setPaintProperty('luxLayer', 'fill-extrusion-color', [
        'interpolate',
        ['linear'],
        ['get', dateObj.toISOString()],
        0, '#3d3d3d',
        25, '#4f4100',
        50, '#7a6400',
        100, '#937900',
        500, '#c19f00',
        1000, '#ffd100',
        10000, '#ffe260',
        32000, '#fff6ce'
    ]);

    // console.log(map.getSource('temp'));
    
    // console.log(map.getSource('temp')._options.data.features[0].properties[dateObj.toISOString()]);
    map.setPaintProperty('luxLayer', 'fill-extrusion-height', ['get', dateObj.toISOString()]);

    map.setPaintProperty('tempLayer', 'circle-color', [
        'interpolate',
        ['linear'],
        ['get', dateObj.toISOString()],
        0, '#ccffff',
        7, 'blue',
        15, '#3399ff',
        20, 'Aqua',
        25, 'yellow',
        30, '#ff9933',
        35, 'red'
    ])



   
}
