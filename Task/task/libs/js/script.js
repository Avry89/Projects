
//Timezone API
$('#btnRun').click(function () {

	$.ajax({
		url: "libs/php/getTimeZone.php",
		type: 'POST',
		dataType: 'json',
		data: {
			longitude: $('#long').val(),
			latitude: $('#lat').val(),
		},
		success: function (result) {

			console.log(JSON.stringify(result));

			if (result.status.name == "ok") {

				$('#sunrise').html(result['data']['sunrise']);
				$('#sunset').html(result['data']['sunset']);
				$('#country').html(result['data']['countryName']);
				$('#timeZone').html(result['data']['timezoneId']);
				$('#timeNow').html(result['data']['time']);

			}

		},
		error: function (jqXHR, textStatus, errorThrown) {
			// your error code
		}
	});

});

//Elevation API

$('#btnRun2').click(function () {

	$.ajax({
		url: "libs/php/getElevation.php",
		type: 'POST',
		dataType: 'json',
		data: {
			longitude: $('#elevationLong').val(),
			latitude: $('#elevationLat').val(),
		},
		success: function (result) {

			console.log(JSON.stringify(result));

			if (result.status.name == "ok") {

				$('#elevation').html(result['data']['srtm1']);
			

			}

		},
		error: function (jqXHR, textStatus, errorThrown) {
			// your error code
		}
	});

});




//Ocean js API

$('#btnRun3').on("click", function () {

	$.ajax({
		url: "libs/php/getOcean.php",
		type: 'POST',
		dataType: 'json',
		data: {
			longitude: $('#oceanLong').val(),
			latitude: $('#oceanLat').val(),

		},
		success: function (result) {

			console.log(JSON.stringify(result));

			if (result.status.name == "ok") {

				$('#distance').html(result['data']['ocean']['distance']);
				$('#geonameId').html(result['data']['ocean']['geonameId']);
				$('#name').html(result['data']['ocean']['name']);


			}

		},
		error: function (jqXHR, textStatus, errorThrown) {
			// your error code
		}
	});

});



