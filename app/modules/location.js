import { $ } from './bling';
import { newUserFriendlyError, catchErrors } from './errorHandling';

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
    if(!coordinates) {
        throw newUserFriendlyError("You need to provide your location");
    }
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

$("#currentLocationBtn") && $("#currentLocationBtn").on("click", catchErrors(getDeviceLocation, { msg: "Error getting location. You may need to give permission."}));
$("#enterLocationBtn") && $("#enterLocationBtn").on("click", toggleLocationBtns);

export { setLocation, getLocation };