import axios from 'axios';
import { $ } from './bling';

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

            let bounds = new google.maps.LatLngBounds();
            const infoWindow = new google.maps.InfoWindow();
            var userLocation = new google.maps.Marker({
                clickable: false,
                position: new google.maps.LatLng(lat, lng),
                icon: new google.maps.MarkerImage('//maps.gstatic.com/mapfiles/mobile/mobileimgs2.png',
                                                    new google.maps.Size(22,22),
                                                    new google.maps.Point(0,18),
                                                    new google.maps.Point(11,11)),
                shadow: null,
                zIndex: 999,
                map
            });

            bounds.extend({lat, lng})

            const markers = casts.map(cast => {
                const [castLng, castLat] = cast.location.coordinates;
                const position = { lat: castLat, lng: castLng };
                bounds.extend(position);
                const marker = new google.maps.Marker( { map, position });
                marker.place = cast;
                return marker;
            });

/*
            //when someone clicks on a marker show details of that place
            markers.forEach(marker => marker.addListener('click', function() {
                const html = `
                    <div class="popup">
                        <a href="/store/${this.place.slug}">
                            <img src="/uploads/${this.place.photo || 'store.png'}" alt="${this.place.name}" />
                            <p> ${this.place.name} - ${this.place.location.address}</p>
                        </a>
                    </div>
                `;
                
                infoWindow.setContent(html);
                infoWindow.open(map, this);
            }));
*/ 
            const center = bounds.getCenter();
            map.setCenter(center);
            map.fitBounds(bounds, 15);
        })
        .catch(console.error);
    
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
        const casts = axios.post('/api/nearby-casts', coordinates)
            .then( response => {
                console.log(response);
            });
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