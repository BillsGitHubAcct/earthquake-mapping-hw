// Store our API endpoint inside queryUrl
  var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";  
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
 
/* The getValue function controls the color of the data points of circles and in the legend */ 
function getValue(mag) {
    return mag >= 5 ? "#cc130a" :
           mag >= 4 ? "#e52920" :
           mag >= 3 ? "#d8673e" :
           mag >= 2 ? "#eab241" :
           mag >= 1 ? "#e9ef32" :
           mag >= 0 ? "#aaff23" :
           "#808080";
		   };
var earthquakes = new L.layerGroup();
var timelineLayer = new L.layerGroup();	

  // Create map with initial starting coordinates and zoom value
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [outdoorMap, earthquakes]
  });
	   
// Perform a GET request to the query URL		   
d3.json(queryUrl, function(response) {
	// Set up start and end date intervals (for 7 days ago to current)
	var getInterval = function(equake) {
          return {
            start: equake.properties.time,
            end:   equake.properties.time + equake.properties.mag * 1800000
          };
        };
		// Set up timeline 
		var timelineControl = L.timelineSliderControl({
          formatOutput: function(date){
            return moment(date).format("YYYY-MM-DD HH:MM:SS");
          }
        });
		var timeline = L.timeline(response, {
		
		getInterval: getInterval,
		// For each data point render circle with fill color and 
		// radius length based on magnitude from features
		pointToLayer: function(feature, latlng) {
			const mag = feature.properties.mag;
			const place = feature.properties.place;
			const etime = feature.properties.time;
            return L.circleMarker(latlng, {
					radius: mag *4,
					fillColor: getValue(mag),
					color: "#000",
					weight: 1,
					opacity: 1,
					fillOpacity: 0.8
// Attach popup with location and other information about the data point
}).bindPopup("<h5>" + place + "<br>(mag. " + mag + ")</h5><hr><p>" + new Date(etime) + "</p>");
	  }
	 }).addTo(earthquakes);
    earthquakes.addTo(myMap);
    // Add Slider Controls to the map and timeline layer
    timelineControl.addTo(myMap);
    timelineControl.addTimelines(timeline);
    timeline.addTo(timelineLayer);
    timelineLayer.addTo(myMap);
    
});
 

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
  faults.addTo(myMap)
})

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
	Faults: faults
  };
  
  var legend = L.control({position: 'bottomright'});  
  
  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  
    // Set the legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend');
    var labels = [];
    var grades = [0, 1, 2, 3, 4, 5];

    //  Add add colors and grades to legend based on the magnitudes 
	// tracked
    for (var i = 0; i <= grades.length-1; i++) {
    	if (i < grades.length-1) {div.innerHTML += '<i style="background:' + getValue(grades[i]) + '"></i> ' + grades[i] + '&ndash;' + grades[i + 1] + '<br>';}
		else {div.innerHTML += '<i style="background:' + getValue(grades[i]) + '"></i>' + grades[i] + ' +';};
    }
    return div;
};

  // Add legend to the map
  legend.addTo(myMap);

