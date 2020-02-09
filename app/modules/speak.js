require('regenerator-runtime/runtime');
import axios from 'axios';
import { $ } from './bling';
import { getLocation } from './location';

const prepareForCast = async () => {
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

$("#castBtn") && $("#castBtn").on("click", (e) => {
	e.preventDefault();
	prepareForCast();
});
$("#stopBtn") && $("#stopBtn").on("click", endCast);

const toggleSuccess = () => {
	$(".cast-form").classList.toggle("d-none");
	$(".success").classList.toggle("d-none");
}


const sendCastData = async () => {
	return new Promise(async (resolve, reject) => {
		const coordinates = getLocation();
		const cast = {
			name: $("#castName").value,
			location: {
				coordinates
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