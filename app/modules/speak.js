'use strict'
require('regenerator-runtime/runtime');
import axios from 'axios';
import { $ } from './bling';
import { getLocation } from './location';
import { catchErrors } from './flashes';
import { createPeer, destroyPeer, getAudioStream } from './peer';

let castID;

$("#castBtn") && $("#castBtn").on("click", async (e) => {
	e.preventDefault();
	await catchErrors(prepareForCast, {
		msg: "Error occurred while preparing cast. Did you provide permission to use audio? Have you given your location?",
		onFail: destroyPeer
	})();
});

const prepareForCast = async () => {
	const [ peerId ] =  await Promise.all([ createPeer(), getAudioStream() ]);
	castID = await sendCastData(peerId);
	toggleSuccess();
}

const endCast = async () => {
	destroyPeer();
	await deleteCast();
	toggleSuccess();
}

$("#stopBtn") && $("#stopBtn").on("click", catchErrors(endCast, {msg: "Error occured while deleting cast"} ));

const sendCastData = async (peerID) => {
		const coordinates = getLocation();
		const cast = {
			name: $("#castName").value,
			coordinates,
			peerID
		};
		
		const response = await axios.post('/api/new-cast', cast);

		if (response.status === 201) {
			return response.data;
		} 

		const err = new Error("Failed with status " + response.status);
		err.specific = true;
		throw err;
}

const toggleSuccess = () => {
	$(".cast-form").classList.toggle("d-none");
	$(".success").classList.toggle("d-none");
}

const deleteCast = async () => {
	await axios.post("/api/end-cast", { id: castID })
}