var videoSources = [];
var selectedVideoSourceIndex = null;
var context = null;
var video = null;
var cameraSetup = false;
var photos = [];
var entries = [];

// Camera
function sortOutSources() {
	MediaStreamTrack.getSources(function (sourceInfos) {
		for (var i = 0; i != sourceInfos.length; ++i) {
			var sourceInfo = sourceInfos[i];
			if (sourceInfo.kind === 'video') {
				videoSources.push(sourceInfo.id);
			}
		}
	});
}

sortOutSources();

function setupCamera() {
	// Grab elements, create settings, etc.
	video = document.getElementById("video");
	var videoObj = {
		video: { optional: [{ sourceId: videoSources[selectedVideoSourceIndex] }] }
	};

	var errBack = function (error) {
		console.log("Video capture error: ", error.code);
	};

	// Put video listeners into place
	if (navigator.getUserMedia) { // Standard
		navigator.getUserMedia(videoObj, function (stream) {
			video.src = stream;
			video.play();
		}, errBack);
	} else if (navigator.webkitGetUserMedia) { // WebKit-prefixed
		navigator.webkitGetUserMedia(videoObj, function (stream) {
			video.src = window.webkitURL.createObjectURL(stream);
			video.play();
		}, errBack);
	}
	else if (navigator.mozGetUserMedia) { // Firefox-prefixed
		navigator.mozGetUserMedia(videoObj, function (stream) {
			video.src = window.URL.createObjectURL(stream);
			video.play();
		}, errBack);
	}
}

function cycleCameras() {
	selectedVideoSourceIndex++;
	if (selectedVideoSourceIndex === videoSources.length) {
		selectedVideoSourceIndex = 0;
	}
	setupCamera();
}

function takePhoto() {
	resetCameraButtons();

	var v = document.getElementById("video");
	var canvas = document.createElement('canvas');
	canvas.width = v.videoWidth;
	canvas.height = v.videoHeight;
	var ctx = canvas.getContext('2d');
	ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
	var img = canvas.toDataURL("image/png");

	var fragment = "<div class=\"no-margin-or-padding photo-thumbnail\"><a><img class=\"thumbnail\" style=\"background-image: url('" + img + "');\"></a></div>";
	var div = document.getElementById("photos-content");
	div.innerHTML = div.innerHTML + fragment;

	photos.push(img.replace(/^data:image\/(png|jpg);base64,/, ""));
}

function openCamera() {
	if (!cameraSetup) {
		selectedVideoSourceIndex = videoSources.length - 1;
		setupCamera();
		cameraSetup = true;
	}
	$(document.getElementById("new")).hide();
	$(document.getElementById("video")).show();
	$(document.getElementById("snap")).show();
	if (videoSources.length > 1) {
		$(document.getElementById("switch")).show();
	}
}

// Data
function submit() {
	var data = {
		// Photos are too large for parse
		// photos: photos,
		details: {
			reference_number: $(document.getElementById("reference_number")).val(),
			address: $(document.getElementById("address")).val(),
			post_code: $(document.getElementById("post_code")).val(),
			comments: $(document.getElementById("comments")).val(),
			location: $(document.getElementById("location")).val()
		},
		timestamp: getTimeStamp()
	}

	entries.push(data);
	setEntries(entries);

	tryUploadEntries();
}

function tryUploadEntries() {
	if (entries.length > 0) {
		disableAll();

		var DataObject = Parse.Object.extend("DataObject");
		var dataObject = new DataObject();

		dataObject.save(entries[0]).then(function (success) {
			setEntries(entries.slice(1)); // Pop first from queue
			tryUploadEntries();
			resetPage();
		}, function (fail) {
			alert('Unfortunately you have no connectivity. The capture will be submitted when your connection is restored.');
			resetPage();
		});
	}
}

function online(event) {
	entries = JSON.parse(localStorage.getItem('entries')) || [];
	if (entries.length > 0) {
		alert('Going to upload ' + entries.length + ' captures');
		tryUploadEntries();
		alert('Successfully uploaded pending captures');
	}
}

function getTimeStamp() {
	var date = new Date();
	return date.toUTCString();
}

function setEntries(newEntries) {
	entries = newEntries;
	localStorage.setItem('entries', JSON.stringify(newEntries));
}

// HTML
function resetPage() {
	$(document.getElementById("reference_number")).val("");
	$(document.getElementById("address")).val("");
	$(document.getElementById("post_code")).val("");
	$(document.getElementById("comments")).val("");
	$(document.getElementById("location")).val("");

	$(".photo-thumbnail").remove();
	resetCameraButtons();
	enableAll();
}

function disableAll() {
	$(document.getElementById("reference_number")).addClass("disabled");
	$(document.getElementById("address")).addClass("disabled");
	$(document.getElementById("post_code")).addClass("disabled");
	$(document.getElementById("comments")).addClass("disabled");
	$(document.getElementById("location")).addClass("disabled");
	$(document.getElementById("new")).addClass("disabled");
	$(document.getElementById("snap")).addClass("disabled");
	$(document.getElementById("switch")).addClass("disabled");
	$(document.getElementById("submit")).addClass("disabled");
}

function enableAll() {
	$(document.getElementById("reference_number")).removeClass("disabled");
	$(document.getElementById("address")).removeClass("disabled");
	$(document.getElementById("post_code")).removeClass("disabled");
	$(document.getElementById("comments")).removeClass("disabled");
	$(document.getElementById("location")).removeClass("disabled");
	$(document.getElementById("new")).removeClass("disabled");
	$(document.getElementById("snap")).removeClass("disabled");
	$(document.getElementById("switch")).removeClass("disabled");
	$(document.getElementById("submit")).removeClass("disabled");
}

function resetCameraButtons() {
	$(document.getElementById("new")).show();
	$(document.getElementById("video")).hide();
	$(document.getElementById("snap")).hide();
	$(document.getElementById("switch")).hide();
}

// Misc
window.addEventListener("DOMContentLoaded", function () {
	if (videoSources.length > 0) {
		$(document.getElementById("photos")).show();
	}

	Parse.initialize("HOESiTR8CzcHsOUNGYhN0sorij4GIXMH4Tqmokpc", "uZUxctDSj9tpX8tfJnYdMnmTtcEfMOJy8lu7sEik");

	window.addEventListener('online', online);
	window.addEventListener('offline', online);

	online({ type: 'ready' });
}, false);

function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition);
	}
}

function showPosition(position) {
	$("#location").val(position.coords.latitude + ", " + position.coords.longitude);
	$(document.getElementById("map")).show();
}

getLocation();
