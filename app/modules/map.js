import axios from 'axios';
import { $, $$ } from './bling';
import { connectToCast } from './listen';
import { catchErrors } from './errorHandling';
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
    console.log(casts);
    if(!casts.length) {
        alert('no casts found!');
        return;
    }
    
    const bounds = new google.maps.LatLngBounds();
    
    addSearchLocationToMap(lat, lng, map, bounds);
    
    casts.forEach((cast,i) => {
        cast.index = i;
        markers[i] = createMarker(cast, i, map, bounds);
        listItems[i] = createListItem(cast, i);
    });        
    
    const center = bounds.getCenter();
    map.setCenter(center);
    map.fitBounds(bounds, 15);

    $$(".cast-connect").on('click', function() {
        catchErrors(connectToCast)(this.dataset.castId);
    });
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
    const position = { lat: cast.lat, lng: cast.lng };

    bounds.extend(position);
    
    const marker = new google.maps.Marker( { 
        map, 
        position,
        icon: 'http://maps.gstatic.com/mapfiles/markers2/marker.png'
    });        
    marker.cast = cast;

    marker.addListener('click', function() {
        selectCast(this.cast.index);        
    });        
    
    return marker;
}        

const createListItem = (cast, i) => {
    const listItem = document.createElement("li");
    listItem.className = "list-group-item";
    listItem.innerHTML = `
                            <div class="row">
                                <div class="col">
                                    <p><strong>${cast.name}</strong></p>
                                    <p>Started ${moment(cast.created).fromNow()}</p>
                                </div>
                                <div class="col-3 my-auto">
                                    <button class="cast-connect btn btn-outline-primary" id="list-item-${i}" data-cast-id=${cast.id}>Connect
                                </div>
                            </div>
                        `;    
    listItem.cast = cast;                    

    listItem.on('click', function() {
        selectCast(this.cast.index);
    })    

    $(".list-group").appendChild(listItem);
    return listItem;
}    

const selectCast = (i) => {
    const marker = markers[i];
    const listItem = listItems[i];
    
    markers.forEach(marker => {
        marker.setIcon('http://maps.gstatic.com/mapfiles/markers2/marker.png');
    });        

    marker.setIcon('//maps.gstatic.com/mapfiles/markers2/icon_green.png');
    showPopupOnMap(marker, map);
    
    $$(".list-group-item").forEach(el => el.classList.remove("active"));
    listItem.classList.add("active");
}    

const showPopupOnMap = (marker, map) => {
    const cast = marker.cast;
    const html = `
                    <div class="popup" style="text-align: center">
                        <p><strong>${cast.name}</strong></p>
                        <p>Created ${moment(cast.created).fromNow()}</p>
                        <button class="cast-connect btn btn-outline-primary btn-sm" data-cast-id=${cast.id}>Connect</button>
                    </div>
                `;    
    infoWindow.setContent(html);            
    infoWindow.open(map, marker);
}

export default makeMap