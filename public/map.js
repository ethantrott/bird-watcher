// create map and specify options
var map = L.map('map',{
    zoomDelta: 0.1,
    zoomSnap: 0.69,
    wheelPxPerZoomLevel: 500
});

// example data for now
var routesData = [
    [
        {lat: 44.935630825671005, lng: -68.6459952865509},
        {lat: 44.927648402571144, lng: -68.64611711046116},
        {lat: 44.920719889986906, lng: -68.64308429917213}
    ],
    [
        {lat: 44.93275787415931, lng: -68.65517564320943},
        {lat: 44.93987194127989, lng: -68.65178788227544}
    ]
]

var northMostLat = -90;
var southMostLat = 90;
var westMostLng = -180;
var eastMostLng = 180;

// Fit the map to the combined bounds of all routes
function fitMapToAllRoutes() {
    var northWestCorner = L.latLng(northMostLat, westMostLng);
    var southEastCorner = L.latLng(southMostLat, eastMostLng);
    var bounds = L.latLngBounds(northWestCorner, southEastCorner);
    map.fitBounds(bounds);
}

routesData.forEach((route)=>{
    // display start and end points
    L.marker([route[0].lat, route[0].lng]).addTo(map);
    L.marker([route[route.length-1].lat, route[route.length-1].lng]).addTo(map);

    // routing (connecting the points)
    var waypoints = []
    route.forEach((point) => {
        if (point.lat > northMostLat) northMostLat = point.lat;
        if (point.lat < southMostLat) southMostLat = point.lat;
        if (point.lng > westMostLng) westMostLng = point.lng;
        if (point.lng < eastMostLng) eastMostLng = point.lng;

        waypoints.push(L.latLng(point.lat, point.lng))
    });
    var routeControl = L.Routing.control({
        waypoints: waypoints,

        // disable auto-zoom to route, we handle this with fitMapToAllRoutes()
        fitSelectedRoutes: false,

        // hide waypoint icons (workaround to only show start and stop points)
        createMarker: function() { return null; },

        // hide directions/itinerary
        show: false,

        lineOptions : {
            // disable dragging to add waypoints
            addWaypoints: false 
        }
    }).addTo(map);

    routeControl.on('routesfound', fitMapToAllRoutes);
});

// map tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);