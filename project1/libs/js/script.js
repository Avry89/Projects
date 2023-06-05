
$(document).ready(function () {
    setTimeout(function () {
        // Delayed fade out of the preloader
        $(".preloader").fadeOut("slow", function () {
            // Preloader fade out complete callback
            // Show the select dropdown
            $('select').removeAttr('hidden');
        });
    }, 2000); // Adjust the delay time (in milliseconds) as needed
});

// Tile layer variables

const openStreet = '<a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>';
const thunderForest = '<a href="http://www.thunderforest.com">Thunderforest</a>';
const mapAttribution = 'Maps &copy; ' + thunderForest + ', Data &copy; ' + openStreet;
const mapTileLayers = ['transport', 'cycle', 'landscape', 'outdoors'];

const mapBaseLayers = {};

// Thunder forest tiles layers

mapTileLayers.map(layer => {
    let tileUrl = 'https://tile.thunderforest.com/' + layer + '/{z}/{x}/{y}.png?apikey=b844895a39854b46af66bfecd8fd258a';
    mapBaseLayers[layer] = L.tileLayer(tileUrl, { attribution: mapAttribution });
});

// Setting map view

const myMap = L.map('map', { maxZoom: 18, minZoom: 3, zoomControl: false, layers: mapBaseLayers.transport }).setView([51, -1], 5);

// Thunder forest tiles layers 


// Earthquake, cities and airports

var cityIcons = L.ExtraMarkers.icon({
    icon: "fa fa-city",
    iconColor: "white",
    markerColor: 'green',
    shape: "square",
    prefix: "fa",

});

var airportIcon = L.ExtraMarkers.icon({
    icon: "fa fa-plane",
    iconColor: "black",
    markerColor: "white",
    shape: "square",
    prefix: "fa",

});

earthquakeIcon = L.ExtraMarkers.icon({
    icon: 'fas fa-globe-europe ',
    markerColor: 'green',
    iconColor: 'black',
    shape: 'penta',
    prefix: 'fa',

});

var cityLayerGroup = L.layerGroup(); // Define cityLayerGroup as a Leaflet layer group
var airportLayerGroup = L.layerGroup(); // Define airportLayerGroup as a Leaflet layer group
var earthquakeLayerGroup = L.layerGroup();

var overlayLayers = {
    "Cities": cityLayerGroup,
    "Airports": airportLayerGroup,
    "Earthquakes": earthquakeLayerGroup
};

// Add the cityLayerGroup and airportLayerGroup to the map
myMap.addLayer(cityLayerGroup);
myMap.addLayer(airportLayerGroup);
myMap.addLayer(earthquakeLayerGroup);




let layerControl = L.control.layers(mapBaseLayers, overlayLayers, null, { position: 'topright' });
layerControl.addTo(myMap);

// Zoom and scale of the map

L.control.zoom({ position: 'topleft' }).addTo(myMap)
L.control.scale().addTo(myMap);

// Buttons

let btn1 = L.easyButton({
    states: [{
        stateName: 'show-country',
        icon: 'fa-info-circle',
        title: 'Country Info',
        onClick: function (control) {
            $("#countryModal").modal("show");
        }
    }]
}).addTo(myMap);

let btn2 = L.easyButton({
    states: [{
        stateName: 'show-currency',
        icon: 'fas fa-dollar-sign',
        title: 'Currency Exchange',
        onClick: function (control) {
            $("#currencyModal").modal("show");
            currencyExchange();
        }
    }]
}).addTo(myMap);

let btn3 = L.easyButton({
    states: [{
        stateName: 'show-weather',
        icon: 'fa-cloud',
        title: 'Weather Forecast',
        onClick: function (control) {
            $("#weatherModal2").modal("show");
            weatherForecast2();
        }
    }]
}).addTo(myMap);

let btn4 = L.easyButton({
    states: [{
        stateName: 'show-holidays',
        icon: 'fa-gifts',
        title: 'Public Holidays',
        onClick: function (control) {
            $("#holidayModal").modal("show");
            publicHolidays();
        }
    }]
}).addTo(myMap);

let btn5 = L.easyButton({
    states: [{
        stateName: 'show-wikipedia',
        icon: 'fab fa-wikipedia-w',
        title: 'Wikipedia',
        onClick: function (control) {
            $("#wikipediaModal").modal("show");
            showWikipedia();
        }
    }]
}).addTo(myMap);

let btn6 = L.easyButton({
    states: [{
        stateName: 'show-pictures',
        icon: 'fa-image',
        title: 'Country Pictures',
        onClick: function (control) {
            $("#picturesModal").modal("show");
            displayCountryImages();
        }
    }]
}).addTo(myMap);






// Populating select with countries

$.ajax({
    url: 'libs/php/populateSelect.php',
    type: 'POST',
    dataType: 'json',
    success: function (result) {
        result['data'].forEach((feature) => {
            $("<option>", {
                value: feature.iso_a2,
                text: feature.name
            }).appendTo("#selectCountry");
        });
    }
});

// Populate select with user location

if (window.navigator.geolocation) {
    window.navigator.geolocation.getCurrentPosition((location) => {
        showLocation(location, () => { countryInformation() })

    });
} else {
    console.log("Please turn on Location Services");
}

function showLocation(location, populateModalCallback,) {
    let latitudeOne = location.coords.latitude
    let longitudeOne = location.coords.longitude

    // Get user location

    $.ajax({
        url: 'libs/php/getUserLocation.php',
        type: 'POST',
        dataType: 'json',
        data: {
            latOne: latitudeOne,
            lngOne: longitudeOne
        },
        success: function (result) {
            if (result.status.name == "ok") {
                $('#selectCountry').val(result.data.countryCode);
                displayCountryMap(result.data.countryCode);

                // Call the functions to update markers

                getCities(result.data.countryCode);
                getAirports(result.data.countryCode);
                displayEarthquakeMarkers(result.data.countryCode);


                populateModalCallback();
            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("ERROR")
        }
    });
};

// Function to display the country map

function displayCountryMap(countryCode) {



    $.ajax({
        url: "libs/php/getCountryBorders.php",
        type: 'GET',
        dataType: 'json',
        data: {
            iso: countryCode
        },
        success: function (result) {
            if (countryBorder != undefined) {
                myMap.removeLayer(countryBorder);
            }
            countryBorder = L.geoJSON(result.data.geometry, {
                style: () => ({
                    color: "Green",
                    weight: 2,
                    opacity: 2,
                })
            }).addTo(myMap);
            myMap.fitBounds(countryBorder.getBounds());
        },
        error: function (err) {
            console.log(err);
        }
    });
}

// Adding borders to selected country 

let countryBorder;

$('#selectCountry').on('change', () => {
    let countryIso = $('#selectCountry').val();



    displayCountryMap(countryIso);
    getCities(countryIso);
    getAirports(countryIso);
    displayEarthquakeMarkers(countryIso);
    countryInformation();

    // Get country borders and add to map

    $.ajax({

        url: "libs/php/getCountryBorders.php",
        type: 'GET',
        dataType: 'json',
        data: {

            iso: $('#selectCountry').val()

        },
        success: function (result) {
            if (countryBorder != undefined) {
                myMap.removeLayer(countryBorder);
            }
            countryBorder = L.geoJSON(result.data.geometry, {
                style: () => ({
                    color: "Green",
                    weight: 2,
                    opacity: 2,
                })
            }).addTo(myMap);
            myMap.fitBounds(countryBorder.getBounds());
        }, error: function (err) {
            console.log(err);
        }
    });

});

// Modals

function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function countryInformation() {
    let countryIso = $('#selectCountry').val();

    $.ajax({
        url: "libs/php/getCountryInfo.php",
        type: 'GET',
        dataType: 'json',
        data: {
            countryCode: countryIso
        },
        success: function (result) {
            $('#continent').text(result.data[0].continent);
            $('#country').text(result.data[0].countryName);
            $('#capital').text(result.data[0].capital);
            $('#population').text(formatNumberWithCommas(result.data[0].population));
            $('#area').text(formatNumberWithCommas(result.data[0].areaInSqKm));
            $('#currency').text(result.data[0].currencyCode);
        },
        error: function (err) {
            console.log(err);
        }
    });
}

$('#selectCountry').on('change', () => countryInformation());


// Currency exchange




// Currency exchange

function currencyExchange() {
    const countryCode = $("#selectCountry").val();
    $.ajax({
        url: "libs/php/getCurrencyExchange.php",
        type: "GET",
        dataType: "json",
        data: {
            countryCode: countryCode
        },
        success: function (response) {
            let baseCurrencyCode = response.data.base_currency_code;
            let baseCurrencyName = response.data.base_currency_name;
            let convertedCurrencyCode = Object.keys(response.data.rates)[0];
            let convertedCurrencyName = response.data.rates[convertedCurrencyCode].currency_name;
            let conversionRate = response.data.rates[convertedCurrencyCode].rate;

            // Clear previous results and inputs
            $("#fromAmount").val("1"); // Reset the "From" input to 1
            $("#toAmount").val((1 * conversionRate).toFixed(2)); // Perform initial conversion for 1 and display in "Result" input

            // Set labels and fields
            $("#fromAmountLabel").text("From " + baseCurrencyName);
            $("#currencyTo").val(" " + convertedCurrencyName);

            // Clears the 0 when user clicks on input field
            $("#fromAmount").focus(function () {
                $(this).val('');
            });

            // Perform conversion when base amount changes
            $("#fromAmount").on('input', function () {
                let fromAmount = $(this).val();
                let toAmount = (fromAmount * conversionRate).toFixed(2);  // Adds only 2 digits after decimal point
                $("#toAmount").val(toAmount);
            });

            $("#currencyModal").modal("show");
        },
        error: function (err) {
            console.log("Error: ", err);
        }
    });
}











//  Weather 

function weatherForecast2() {
    const countryCode = $("#selectCountry").val();

    $('#pre-load').fadeIn();



    $.ajax({
        url: "libs/php/getWeatherForecast.php",
        type: "POST",
        dataType: "json",
        data: {
            countryCode: countryCode
        },
        success: function (result) {
            var d = result.data;

            $('#weatherModalLabel').html(d.location + ", " + d.country);

            $('#todayConditions').html(d.forecast[0].conditionText);
            $('#todayIcon').attr("src", d.forecast[0].conditionIcon);
            $('#todayMaxTemp').html(Math.floor(d.forecast[0].maxC));
            $('#todayMinTemp').html(Math.floor(d.forecast[0].minC));

            $('#day1Date').text(moment(d.forecast[1].date).format("ddd Do"));
            $('#day1Icon').attr("src", d.forecast[1].conditionIcon);
            $('#day1MinTemp').text(Math.floor(d.forecast[1].minC));
            $('#day1MaxTemp').text(Math.floor(d.forecast[1].maxC));

            $('#day2Date').text(moment(d.forecast[2].date).format("ddd Do"));
            $('#day2Icon').attr("src", d.forecast[2].conditionIcon);
            $('#day2MinTemp').text(Math.floor(d.forecast[2].minC));
            $('#day2MaxTemp').text(Math.floor(d.forecast[2].maxC));

            $('#lastUpdated').text(moment(d.lastUpdated).format("HH:mm, Do MMM"));

            $('#pre-load').fadeOut();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $('#weatherModal2 .modal-title').replaceWith("Error retrieving data");
            console.log(textStatus, errorThrown);
        }
    });

}




// Public holidays

function publicHolidays() {
    const countryCode = $("#selectCountry").val();
    const currentYear = new Date().getFullYear(); // Get the current year

    $.ajax({
        url: "libs/php/getPublicHolidays.php",
        type: "GET",
        dataType: "json",
        data: {
            countryCode: countryCode
        },
        success: function (result) {
            let holidays = result;

            let tableHtml = '<table class="table table-striped">';
            tableHtml += '<tbody>';

            for (let i = 0; i < holidays.length; i++) {
                let formattedDate = moment(holidays[i].date).format("Do MMM");

                tableHtml += '<tr>';
                tableHtml += '<td class="text-start">' + holidays[i].name + '</td>';
                tableHtml += '<td class="text-end">' + formattedDate + '</td>';
                tableHtml += '</tr>';
            }

            tableHtml += '</tbody></table>';

            // Dynamically set the modal title with the current year
            $("#holidayModal .modal-title").html("Public Holidays " + currentYear);

            $("#holidayModal .modal-body").html(tableHtml);
            $("#holidayModal").modal("show");
        },
        error: function (jqXHR, textStatus, errorThrown) {
            let errorText = "An error occurred while fetching public holidays.";
            if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                errorText += " " + jqXHR.responseJSON.message;
            }
            console.log(errorText);
        }
    });
}







// Wikipedia 

function showWikipedia() {
    const countryCode = $("#selectCountry").val();
    $.ajax({
        url: "libs/php/getWikipedia.php", // 
        type: "GET",
        dataType: "json",
        data: {
            countryCode: countryCode
        },
        success: function (response) {
            if (response.data.wikipedia) {
                $("#wikiTitle").text(response.data.wikipedia.title || "");
                $("#wikiExtract").text(response.data.wikipedia.extract || "");
                $("#wikiLink").attr("href", response.data.wikipedia.content_urls?.desktop?.page || "#");
            }
            $("#wikipediaModal").modal("show");
        },
        error: function (err) {
            console.log("Error: ", err);
        }
    });
}

// Country pictures

function displayCountryImages() {
    const countryCode = $("#selectCountry").val();
    $.ajax({
        url: "libs/php/getCountryPictures.php",
        type: "GET",
        dataType: "json",
        data: {
            countryCode: countryCode
        },
        success: function (result) {
            let images = result.data.unsplash || [];
            let imageHtml = '';

            for (let i = 0; i < images.length; i++) {
                let activeClass = i === 0 ? 'active' : '';
                imageHtml += '<div class="carousel-item ' + activeClass + '">';
                imageHtml += '<img class="d-block w-100" src="' + (images[i].urls?.small || '') + '">';
                imageHtml += '</div>';
            }

            $('#carouselInner').html(imageHtml);
            $('#carouselExampleIndicators').carousel();  // initialize the carousel
            $('#picturesModal').modal('show');
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });
}



// Earthquake, cities and airports

function getCities(countryCode) {
    $.ajax({
        url: "libs/php/getCities.php",
        type: "POST",
        dataType: "json",
        data: { countryCode: countryCode },
        success: function (res) {
            let markers = L.markerClusterGroup({
                polygonOptions: {
                    fillColor: "green",
                    color: "green",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.5,
                    radius: 50,
                    className: 'city-cluster'
                },
            });

            for (let i = 0; i < res.data.length; i++) {
                const cityLatLng = [res.data[i].lat, res.data[i].lng];

                let cityName = res.data[i].name;
                let population = res.data[i].population;
                let nearbyCitiesMarker = L.marker(cityLatLng, {
                    icon: cityIcons,
                });
                nearbyCitiesMarker.bindTooltip(
                    `<strong>${cityName}</strong><div class='col text-center'><br> ${population.toLocaleString()}`,
                    {
                        direction: 'top',
                        sticky: true,
                        className: 'custom-tooltip',
                        offset: [0, -10],
                    }
                );

                markers.addLayer(nearbyCitiesMarker);
            }

            cityLayerGroup.clearLayers(); // Clear previous city markers
            cityLayerGroup.addLayer(markers); // Add the markers to the cityLayerGroup

            // Remove previous cityLayerGroup from the map and add the updated one
            myMap.removeLayer(cityLayerGroup);
            myMap.addLayer(cityLayerGroup);
        },
    });
}

function getAirports(countryCode) {
    $.ajax({
        url: "libs/php/getAirports.php",
        type: "POST",
        dataType: "json",
        data: { countryCode: countryCode },
        success: function (res) {
            let markers = L.markerClusterGroup({
                polygonOptions: {
                    fillColor: "white",
                    color: "white",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.5,
                    radius: 50,
                    className: 'airport-cluster'
                },
            });

            for (let i = 0; i < res.data.length; i++) {
                const airportLatLng = [res.data[i].lat, res.data[i].lng];

                let airportName = res.data[i].name;

                let nearbyAirportMarker = L.marker(airportLatLng, {
                    icon: airportIcon,
                });
                nearbyAirportMarker.bindTooltip(airportName, {
                    direction: 'top',
                    sticky: true,
                    className: 'custom-tooltip',
                    offset: [0, -10],
                });

                markers.addLayer(nearbyAirportMarker);
            }

            airportLayerGroup.clearLayers(); // Clear previous airport markers
            airportLayerGroup.addLayer(markers); // Add the markers to the airportLayerGroup

            // Remove previous airportLayerGroup from the map and add the updated one
            myMap.removeLayer(airportLayerGroup);
            myMap.addLayer(airportLayerGroup);
        },
    });
}


// Earthquake

function displayEarthquakeMarkers(countryCode) {
    $.ajax({
        url: "libs/php/getCoordinates.php",
        type: "POST",
        dataType: "json",
        data: {
            countryCord: countryCode
        },
        success: function (result) {
            let north = result.data.geonames[0].north;
            let east = result.data.geonames[0].east;
            let south = result.data.geonames[0].south;
            let west = result.data.geonames[0].west;

            // Earthquake
            $.ajax({
                url: "libs/php/getEarthquakeInfo.php",
                type: "POST",
                dataType: "json",
                data: {
                    north: north,
                    south: south,
                    east: east,
                    west: west
                },
                success: function (result) {
                    if (result.status.name == "ok") {
                        let earthquakes = result.data;

                        let earthquake = L.markerClusterGroup({
                            polygonOptions: {
                                fillColor: "white",
                                color: "white",
                                weight: 1,
                                opacity: 1,
                                fillOpacity: 0.5,
                                radius: 50
                            }
                        });

                        for (let i = 0; i < earthquakes.length; i++) {
                            let lat = earthquakes[i].lat;
                            let lng = earthquakes[i].lng;
                            let mag = earthquakes[i].magnitude;
                            let depth = earthquakes[i].depth;
                            let datetime = earthquakes[i].datetime;

                            let formattedDate = moment(datetime).format("h:mm a on Do MMMM YYYY");

                            let marker = L.marker([lat, lng], { icon: earthquakeIcon });

                            marker.bindTooltip(
                                '<div class="text-center">(' +
                                lat.toFixed(4) +
                                ", " +
                                lng.toFixed(4) +
                                ")</div>" +
                                '<div class="popup-datetime text-center">An earthquake of ' +
                                mag +
                                " magnitude to a depth of " +
                                depth +
                                " km at " +
                                formattedDate +
                                "</div>",
                                { direction: "top", sticky: true }
                            );

                            earthquake.addLayer(marker);
                        }

                        earthquakeLayerGroup.clearLayers(); // Clear previous earthquake markers
                        earthquakeLayerGroup.addLayer(earthquake); // Add the markers to the earthquakeLayerGroup

                        // Remove previous earthquakeLayerGroup from the map and add the updated one
                        myMap.removeLayer(earthquakeLayerGroup);
                        myMap.addLayer(earthquakeLayerGroup);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log("ERROR");
                }
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("ERROR");
        }
    });
}
