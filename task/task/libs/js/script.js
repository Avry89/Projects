
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

//Country info API

$('#btnRun2').on("click", function () {

	$.ajax({
		url: "libs/php/getCountryInfo.php",
		type: 'POST',
		dataType: 'json',
		data: {
			country: $('#selCountry').val(),
			lang: $('#selLanguage').val()
		},
		success: function (result) {

			console.log(JSON.stringify(result));

			if (result.status.name == "ok") {

				$('#txtContinent').html(result['data'][0]['continent']);
				$('#txtCapital').html(result['data'][0]['capital']);
				$('#txtLanguages').html(result['data'][0]['languages']);
				$('#txtPopulation').html(result['data'][0]['population']);
				$('#txtArea').html(result['data'][0]['areaInSqKm']);

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

