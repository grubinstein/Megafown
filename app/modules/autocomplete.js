import { setLocation } from './location';
import { $ } from './bling';

function autocomplete(input) {
	if(!input) return;
	const dropdown = new google.maps.places.Autocomplete(input);
	
	dropdown.addListener('place_changed', () => {
		const place = dropdown.getPlace();
		const coordinates = [
			place.geometry.location.lat(),
			place.geometry.location.lng()
		];
		setLocation(coordinates);
	});
	input.on('keydown', (e) => {
		if(e.keycode === 13) e.preventDefault();
	})
}

autocomplete($(".autocomplete"));
