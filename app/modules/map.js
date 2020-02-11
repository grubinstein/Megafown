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

            let bounds = new google.maps.LatLngBounds();
            const infoWindow = new google.maps.InfoWindow();
            
            var myloc = new google.maps.Marker({
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
            
            const listItems = casts.map(cast => {
                const listItem = document.createElement("li");
                listItem.className = "list-group-item ";
                listItem.innerHTML = "<p>" + cast.name + "<p>";
                $(".list-group").appendChild(listItem);
                return listItem;
            })
            
            const markers = casts.map((cast,i) => {
                const [castLng, castLat] = cast.location.coordinates;
                const position = { lat: castLat, lng: castLng };
                bounds.extend(position);
                const marker = new google.maps.Marker( { 
                    map, 
                    position,
                    icon: 'http://maps.gstatic.com/mapfiles/markers2/marker.png'
                });
                marker.place = cast;
                marker.addListener('click', function() {
                    markers.forEach(marker => {
                        marker.setIcon('http://maps.gstatic.com/mapfiles/markers2/marker.png');
                    });
                    this.setIcon('//maps.gstatic.com/mapfiles/markers2/icon_green.png');
                    $$(".list-group-item").forEach(el => el.classList.remove("active"));
                    listItems[i].classList.add("active");
                });
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