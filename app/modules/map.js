import axios from 'axios';
import { $, $$ } from './bling';
const markers = [];
const listItems = [];
const infoWindow = new google.maps.InfoWindow();

function makeMap(mapDiv) {
    const mapOptions = {
        center: { lat: 43.2, lng: -79.8 },
        zoom: 15
    }
    const map = new google.maps.Map(mapDiv, mapOptions);

    $(".location").on("locationChanged", (event) => {
        const [ lat, lng ] = event.detail.coordinates;
        clearCasts();

        fetchCasts(lat, lng)
            .then(res => loadCasts(res.data, map, lat, lng));
    });
};

const clearCasts = () => {
    markers.forEach(m => m.setMap(null));
    markers.length = 0;

    listItems.forEach(i => i.parentElement.removeChild(i));
    listItems.length = 0;
}

const fetchCasts = async (lat, lng) => await axios.post(
    '/api/nearby-casts', 
    { lat, lng } 
);

const loadCasts = ( casts, map, lat, lng ) => {
    if(!casts.length) {
        alert('no casts found!');
        return;
    }
    
    const bounds = new google.maps.LatLngBounds();
    
    addSearchLocationToMap(lat, lng, map, bounds);
    
    casts.forEach((cast,i) => {
        markers[i] = createMarker(cast, i, map, bounds);
        listItems[i] = createListItem(cast, i);
    });        
    
    const center = bounds.getCenter();
    map.setCenter(center);
    map.fitBounds(bounds, 15);
};        

const addSearchLocationToMap = (lat, lng, map, bounds) => {
    const position = new google.maps.LatLng(lat, lng);
    var myLocation = new google.maps.Marker({
        position,
        clickable: false,
        icon: new google.maps.MarkerImage('//maps.gstatic.com/mapfiles/mobile/mobileimgs2.png',
            new google.maps.Size(22,22),
            new google.maps.Point(0,18),
            new google.maps.Point(11,11)
        ),
        shadow: null,
        zIndex: 999,
        map
    });    
    bounds.extend(position);
}    

const createMarker = (cast, i, map, bounds) => {
    const [castLng, castLat] = cast.location.coordinates;
    const position = { lat: castLat, lng: castLng };

    bounds.extend(position);
    
    const marker = new google.maps.Marker( { 
        map, 
        position,
        icon: 'http://maps.gstatic.com/mapfiles/markers2/marker.png'
    });        
    marker.cast = cast;
    marker.castIndex = i;

    marker.addListener('click', function() {
        selectCast(this);        
    });        
    
    return marker;
}        

const createListItem = (cast, i) => {
    const listItem = document.createElement("li");
    listItem.className = "list-group-item";
    listItem.innerHTML = `
                            <p><strong>${cast.name}</strong></p>
                            <p>Started ${moment(cast.created).fromNow()}</p>
                        `;    
    listItem.cast = cast;                    
    listItem.castIndex = i;

    listItem.on('click', function() {
        selectCast(this);
    })    

    $(".list-group").appendChild(listItem);
    return listItem;
}    

const selectCast = (clicked) => {
    markers.forEach(marker => {
        marker.setIcon('http://maps.gstatic.com/mapfiles/markers2/marker.png');
    });        

    const marker = markers[clicked.castIndex];
    marker.setIcon('//maps.gstatic.com/mapfiles/markers2/icon_green.png');
    
    const html = `
                    <div class="popup">
                    <p><strong>${clicked.cast.name}</strong></p>
                    <p>Created ${moment(clicked.cast.created).fromNow()}</p>
                    </div>
                `;    
    infoWindow.setContent(html);            
    infoWindow.open(map, marker);
    
    $$(".list-group-item").forEach(el => el.classList.remove("active"));
    listItems[clicked.castIndex].classList.add("active");
}    

export default makeMap