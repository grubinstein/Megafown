'use strict'
require('regenerator-runtime/runtime');
import axios from 'axios';
import { $ } from './bling';
import { getLocation } from './location';
import { newErrorFlash, removeErrorFlash, catchErrors } from './flashes';
import { createPeer, destroyPeer, getAudioStream } from './peer';

let castId;

const prepareForCast = async () => {
	const [ peerId ] =  await Promise.all([ createPeer(), getAudioStream() ]);
	const cast = await sendCastData(peerId);
	castId = cast._id;
	toggleSuccess();
}

const endCast = async () => {
	destroyPeer();
	deleteCast();
	toggleSuccess();
}

$("#castBtn") && $("#castBtn").on("click", (e) => {
	e.preventDefault();
	catchErrors(prepareForCast, {
		msg: "Error occurred while preparing cast. Did you provide permission to use audio?",
		onFail: destroyPeer
	})();
});

$("#stopBtn") && $("#stopBtn").on("click", catchErrors(endCast, {msg: "Error occured while deleting cast"} ));

const sendCastData = async (peerId) => {
	return new Promise(async (resolve, reject) => {
		const coords = getLocation();
		const cast = {
			name: $("#castName").value,
			location: {
				coordinates: [
					coords[1],
					coords[0]
				]
			},
			peerId
		};
		
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

const toggleSuccess = () => {
	$(".cast-form").classList.toggle("d-none");
	$(".success").classList.toggle("d-none");
}

const deleteCast = async () => {
	await axios.post("/api/end-cast", { id: castId })
}