require('regenerator-runtime/runtime');
const axios = require('axios');
const { $ } = require('./bling');
import autocomplete from './autocomplete'

autocomplete($("#location"), $("#lat"), $("#lng"));

const getCurrentLocation = () => {
	navigator.geolocation.getCurrentPosition( (position) => {
		$("#lat").value = position.coords.latitude;
		$("#lng").value = position.coords.longitude;
		toggleLocationBtns();
	},(err) => {
		window.location.href = "/locationError"
	});
};

const enterLocation = () => {
	toggleLocationBtns();
};

const prepareForCast = async () => {
	//TODO Move peer instantiation here.
	const [err, stream] = await getAudioStreamPromise();
	if(err) { console.log(err); window.location.href = "/streamError"; return;}
	window.localStream = stream;

	sendCastData()
		.then((cast) => {
			window.castId = cast._id;
			toggleSuccess();
		})
		.catch((err) => { console.log(err); window.location.href = "/dataError"; });
}

const endCast = () => {
	window.peer.destroy();
	axios.post("/api/end-cast", { id: window.castId })
		.then( () => {
			toggleSuccess();
		})
		.catch( (err) => {

		})
}

$("#currentLocationBtn").on("click", getCurrentLocation);
$("#enterLocationBtn").on("click", enterLocation);
$("#castBtn").on("click", (e) => {
	e.preventDefault();
	prepareForCast();
});
$("#stopBtn").on("click", endCast);

const toggleSuccess = () => {
	$(".cast-form").classList.toggle("d-none");
	$(".success").classList.toggle("d-none");
}


const sendCastData = () => {
	return new Promise((resolve, reject) => {
		const cast = {
			name: $("#castName").value,
			location: {
				coordinates: [
					$("#lng").value,
					$("#lat").value
				]
			},
			peerid: window.peer.id
		}
		
		axios.post('/api/new-cast', cast)
			.then((response) => {
				if(response.status == 201) {
					resolve(response.data) 
				} else {
					reject("Failed with status " + response.status);
				}
			})
			.catch((err) =>  {
				reject(err)
			});
	})
}

const getCastName = () => {
	return document.getElementById("castName").value;
}

const getAudioStreamPromise = () => {
	return (
		new Promise((resolve, reject) => {
			const getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)).bind(navigator);
			getUserMedia({video: false, audio:true}, (stream) => {
				resolve(stream);
			}, (err) => {
				reject(err);
			});
		})
	).then( data => {
		return [null, data];
	})
	.catch( err => [err] )
};



const toggleLocationBtns = () => {
	const locationInput = $("#location")
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