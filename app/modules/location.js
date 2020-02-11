import { $ } from './bling';
import { newErrorFlash, removeErrorFlash, catchErrors } from './flashes';

let coordinates;

const setLocation = (newCoordinates) => {
    coordinates = newCoordinates;
    const locationElement = $(".location");
    const locationChangedEvent = new CustomEvent("locationChanged", { 
        detail: {
            coordinates 
        }
    });
    locationElement.dispatchEvent(locationChangedEvent);
}

const getLocation = () => {
    return coordinates;
}

const getDeviceLocation = () => new Promise( (resolve, reject) => {
    navigator.geolocation.getCurrentPosition(position => {
        coordinates = [position.coords.latitude, position.coords.longitude];
        setLocation(coordinates);
        toggleLocationBtns();
        resolve();
    }, reject);
});

const toggleLocationBtns = () => {
    const locationInput = $(".autocomplete")
    if(locationInput.placeholder == "Type to find location") {
        locationInput.placeholder = "Using current location";
        locationInput.style.backgroundColor = "#CCCCCC";
    } else {
        locationInput.placeholder = "Type to find location";
        locationInput.value = null;
        locationInput.style.backgroundColor = "#FFFFFF"
    }
    locationInput.disabled = !locationInput.disabled;
    $("#currentLocationBtn").classList.toggle("d-none");
    $("#enterLocationBtn").classList.toggle("d-none");
}

$("#currentLocationBtn") && $("#currentLocationBtn").on("click", catchErrors(getDeviceLocation));
$("#enterLocationBtn") && $("#enterLocationBtn").on("click", toggleLocationBtns);

export { setLocation, getLocation };