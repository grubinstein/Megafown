import { $ } from './bling';

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

const getDeviceLocation = () => {
    navigator.geolocation.getCurrentPosition(position => {
        console.log(this);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        coordinates = [lat, lng];
        setLocation(coordinates);
        toggleLocationBtns();
    });
}

const toggleLocationBtns = () => {
    const locationInput = $(".autocomplete")
    if(locationInput.placeholder == "Type to find location") {
        locationInput.placeholder = "Using current location";
        locationInput.style.backgroundColor = "#CCCCCC";
    } else {
        locationInput.placeholder = "Type to find location";
        locationInput.style.backgroundColor = "#FFFFFF"
    }
    locationInput.disabled = !locationInput.disabled;
    $("#currentLocationBtn").classList.toggle("d-none");
    $("#enterLocationBtn").classList.toggle("d-none");
}

$("#currentLocationBtn") && $("#currentLocationBtn").on("click", getDeviceLocation);
$("#enterLocationBtn") && $("#enterLocationBtn").on("click", toggleLocationBtns);

export { setLocation, getLocation };