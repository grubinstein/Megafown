import axios from 'axios';
import { $, $$ } from './bling';

const mapOptions = {
    center: { lat: 43.2, lng: -79.8 },
    zoom: 15
}
// could get location from navigator.geolocation.getCurrentPosition

function loadPlaces(map, lat = 43.2, lng = -79.8) {
    axios.post('/api/nearby-casts', {
        lat,
        lng
    })
        .then(res => {
            const casts = res.data;
            if(!casts.length) {
                alert('no casts found!');
                return;
            }

            const bounds = new google.maps.LatLngBounds();
            const infoWindow = new google.maps.InfoWindow();
            
            addMyLocationToMap(new google.maps.LatLng(lat, lng), map);
            bounds.extend({lat, lng});
            
            const listItems = casts.map(createListItem);
            
            const markers = casts.map((cast,i) => {
                const [castLng, castLat] = cast.location.coordinates;
                const position = { lat: castLat, lng: castLng };
                bounds.extend(position);
                const marker = new google.maps.Marker( { 
                    map, 
                    position,
                    icon: 'http://maps.gstatic.com/mapfiles/markers2/marker.png'
                });
                marker.cast = cast;
                marker.addListener('click', function() {
                    markers.forEach(marker => {
                        marker.setIcon('http://maps.gstatic.com/mapfiles/markers2/marker.png');
                    });
                    this.setIcon('//maps.gstatic.com/mapfiles/markers2/icon_green.png');

                    const html = `
                        <div class="popup">
                            <p><strong>${this.cast.name}</strong></p>
                            <p>Created ${moment(this.cast.created).fromNow()}</p>
                        </div>
                    `;
                    infoWindow.setContent(html);
                    infoWindow.open(map, this);
                    
                    $$(".list-group-item").forEach(el => el.classList.remove("active"));
                    listItems[i].classList.add("active");
                });
                marker.addListener('click', function() {
            })
                return marker;
            });

            listItems.forEach((listItem,i) => {
                listItem.on('click', function() {
                    markers.forEach(marker => {
                        marker.setIcon('http://maps.gstatic.com/mapfiles/markers2/marker.png');
                    });
                    markers[i].setIcon('//maps.gstatic.com/mapfiles/markers2/icon_green.png');
                    $$(".list-group-item").forEach(el => el.classList.remove("active"));
                    this.classList.add("active");
                })
            })
            
            const center = bounds.getCenter();
            map.setCenter(center);
            map.fitBounds(bounds, 15);
        })
        .catch(console.error);
    
}

function addMyLocationToMap(position, map) {
    var myLocation = new google.maps.Marker({
                clickable: false,
                position,
                icon: new google.maps.MarkerImage('//maps.gstatic.com/mapfiles/mobile/mobileimgs2.png',
                                                    new google.maps.Size(22,22),
                                                    new google.maps.Point(0,18),
                                                    new google.maps.Point(11,11)),
                shadow: null,
                zIndex: 999,
                map
            });
}

function createListItem(cast) {
    const listItem = document.createElement("li");
    listItem.className = "list-group-item";
    listItem.innerHTML = `
                            <p><strong>${cast.name}</strong></p>
                            <p>Started ${moment(cast.created).fromNow()}</p>
                        `;
    $(".list-group").appendChild(listItem);
    return listItem;
}

function makeMap(mapDiv) {
    const map = new google.maps.Map(mapDiv, mapOptions);

    $(".location").on("locationChanged", (event) => {
        const coordinates = {
            lat: event.detail.coordinates[0],
            lng: event.detail.coordinates[1]
        };
        loadPlaces(map, event.detail.coordinates[0], event.detail.coordinates[1]);
        map.setCenter(coordinates);
    });
    /*loadPlaces(map);

    const input = $('[name="geolocate"]')
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng());
    })
    */
};

$('#map') && makeMap($('#map'));

export default makeMap