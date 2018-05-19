// Store our API endpoint inside queryUrl
  var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";  
 /* var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson"; */
// Perform a GET request to the query URL


d3.json(queryUrl, function(data) {
// Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  
 
});
/* The getValue function controls the color of the data points */ 
function getValue(mag) {
    return mag >= 5 ? "#cc130a" :
           mag >= 4 ? "#e52920" :
           mag >= 3 ? "#d8673e" :
           mag >= 2 ? "#eab241" :
           mag >= 1 ? "#e9ef32" :
           mag >= 0 ? "#aaff23" :
           "#808080";
		   }
function createFeatures(earthquakeData) {

  //
  // Give each feature a popup describing the place and time of the earthquake
  //
  var earthquakes = L.geoJSON(earthquakeData, {
    /* onEachFeature: onEachFeature, */
	pointToLayer: function (feature, latlng) {
			const mag = feature.properties.mag;
			return L.circleMarker(latlng, {
				radius: mag *4,
				fillColor: getValue(mag),
				color: "#000",
				weight: 1,
				opacity: 1,
				fillOpacity: 0.8
  }).bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + " Magnitude:" + feature.properties.mag + "</p>");
  }
  })
  
  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
 
}

function createMap(earthquakes) {

  // Define tile layers
  var outdoorMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiYmlsbHdpbHNvbiIsImEiOiJjamd3dmd0ZjYwNmx2MndsbHg1" +
"bG1iMTEyIn0.k0aRyiQiJ5ZYmrWP6ZAJ-A" );

  var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiYmlsbHdpbHNvbiIsImEiOiJjamd3dmd0ZjYwNmx2MndsbHg1" +
"bG1iMTEyIn0.k0aRyiQiJ5ZYmrWP6ZAJ-A");

var satMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoiYmlsbHdpbHNvbiIsImEiOiJjamd3dmd0ZjYwNmx2MndsbHg1" +
"bG1iMTEyIn0.k0aRyiQiJ5ZYmrWP6ZAJ-A");

  // Define a baseMaps object to hold our base layers
var baseMaps = {
    "Outdoors Map": outdoorMap,
    "Dark Map": darkMap,
	"Satelite Map": satMap
  };
  

// Add faults data to layer
var faults = new L.layerGroup();

faultsURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

d3.json(faultsURL, function(response) {
  function faultStyle(feature) {
    return {
      weight: 3,
      color: "red"
    };
  }

  L.geoJSON(response, {
    style: faultStyle
  }).addTo(faults);
  faults.addTo(map)
})

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
	Faults: faults
  };
  
  var legend = L.control({position: 'bottomright'});  
  
  // Create our map, giving it the outdoormap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [outdoorMap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  
    // Setting up the legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend');
    var labels = [];
    var grades = [0, 1, 2, 3, 4, 5];

    
    for (var i = 0; i <= grades.length-1; i++) {
    	if (i < grades.length-1) {div.innerHTML += '<i style="background:' + getValue(grades[i]) + '"></i> ' + grades[i] + '&ndash;' + grades[i + 1] + '<br>';}
		else {div.innerHTML += '<i style="background:' + getValue(grades[i]) + '"></i>' + grades[i] + ' +';};
    }
    return div;
};

  // Adding legend to the map
  legend.addTo(myMap);

}
