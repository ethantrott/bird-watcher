// create map and specify options
var map = L.map('map',{
    zoomDelta: 0.1,
    zoomSnap: 0.69,
    wheelPxPerZoomLevel: 500
});

var northMostLat = -90;
var southMostLat = 90;
var westMostLng = -180;
var eastMostLng = 180;

// Fit the map to the combined bounds of all points
function fitMapToAllPoints() {
    var northWestCorner = L.latLng(northMostLat, westMostLng);
    var southEastCorner = L.latLng(southMostLat, eastMostLng);
    var bounds = L.latLngBounds(northWestCorner, southEastCorner);
    map.fitBounds(bounds);
}

fetch('/api/history/latest').then(function(response) {
    return response.json();
}).then(response => {
    const birdData = response.birds;

    birdData.forEach((bird)=>{
        console.log(bird);
        const locData = bird.location;

        L.marker([locData.x, locData.y]).addTo(map);

        if (locData.x > northMostLat) northMostLat = locData.x;
        if (locData.x < southMostLat) southMostLat = locData.x;
        if (locData.y > westMostLng) westMostLng = locData.y;
        if (locData.y < eastMostLng) eastMostLng = locData.y;  
    });
    fitMapToAllPoints()

    document.getElementById("timeinfo").innerHTML = "Data retrieved at " + new Date(response.time_utc).toLocaleString();
}).catch(error => console.error(error));



// map tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);