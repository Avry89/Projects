
$(document).ready(function () {
    $(".preloader").fadeOut("slow");
    $('select').removeAttr('hidden');

});


// Tile layer variables

const osmProvider = '<a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>';
const thunderForestProvider = '<a href="http://www.thunderforest.com">Thunderforest</a>';
const mapAttribution = 'Maps &copy; ' + thunderForestProvider + ', Data &copy; ' + osmProvider;
const mapTileLayers = ['cycle', 'transport', 'landscape', 'outdoors'];

const mapBaseLayers = {};

// Thunder forest tiles layers

mapTileLayers.map(layer => {
    let tileUrl = 'https://tile.thunderforest.com/' + layer + '/{z}/{x}/{y}.png?apikey=b844895a39854b46af66bfecd8fd258a';
    mapBaseLayers[layer] = L.tileLayer(tileUrl, { attribution: mapAttribution });
});

// Setting map view

const myMap = L.map('map', { maxZoom: 18, minZoom: 3, zoomControl: false, layers: mapBaseLayers.cycle }).setView([51, -1], 5);

// Thunder forest tiles layers 

let layerControl = L.control.layers(mapBaseLayers, null, { position: 'topleft' });
layerControl.addTo(myMap);

// Zoom and scale of the map

L.control.zoom({ position: 'topright' }).addTo(myMap);
L.control.scale().addTo(myMap);



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
        showLocation(location, () => { populateModal(), weatherForecast })

    });
} else {
    console.log("Please turn on Location Services");
}

function showLocation(location, populateModalCallback, weatherForecast) {
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
                displayEarthquakeMarkers(result.data.countryCode);
                displayPlaceOfInterestMarkers(result.data.countryCode);

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

    // Get country borders and add to map

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
    displayEarthquakeMarkers(countryIso);
    displayPlaceOfInterestMarkers(countryIso);
    populateModal();

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

// Populate modal

function populateModal() {

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
            $('#population').text(result.data[0].population);
            $('#area').text(result.data[0].areaInSqKm);
            $('#currency').text(result.data[0].currencyCode);

            

        },
        error: function (err) {
            console.log(err);
        }
    });


}

$('#selectCountry').on('change', () => populateModal());


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
            
            var baseCurrencyCode = response.data.base_currency_code;
            var baseCurrencyName = response.data.base_currency_name;
            
            var convertedCurrencyCode = Object.keys(response.data.rates)[0];
            var convertedCurrencyName = response.data.rates[convertedCurrencyCode].currency_name;
            var conversionRate = response.data.rates[convertedCurrencyCode].rate;

            
            $("#baseCurrencyCode").text("Base Currency Code: " + baseCurrencyCode);
            $("#baseCurrencyName").text("Base Currency Name: " + baseCurrencyName);
            $("#convertedCurrencyCode").text("Country Currency Code: " + convertedCurrencyCode);
            $("#convertedCurrencyName").text("Country Currency Name: " + convertedCurrencyName);
            $("#conversionRate").text("Conversion Rate: " + conversionRate);

            
            $("#currencyModal").modal("show");
        },

        error: function (err) {
            console.log("Error: ", err);
        }
    });


}
//  Weather 

function weatherForecast() {
    const countryCode = $("#selectCountry").val();
    $.ajax({
        url: "libs/php/getWeatherForecast.php",
        type: "POST",
        dataType: "json",
        data: {
            countryCode: countryCode
        },
        success: function (result) {
            $('#temp').text(result.data.temp);
            $('#feels_like').text(result.data.feels_like);
            $('#temp_min').text(result.data.temp_min);
            $('#temp_max').text(result.data.temp_max);
            $('#pressure').text(result.data.pressure);
            $('#humidity').text(result.data.humidity);
            $('#main').text(result.data.main);
            $('#description').text(result.data.description);

        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });
}

// Public holidays

function publicHolidays() {
    const countryCode = $("#selectCountry").val();

    $.ajax({
        url: "libs/php/getPublicHolidays.php",
        type: "GET",
        dataType: "json",
        data: {
            countryCode: countryCode
        },
        success: function (result) {
            var html = '';
            for (let i = 0; i < result.length; i++) {
                html += '<div class="holiday">';
                html += '<span class="date">Date: ' + result[i].date + '</span>';
                html += '<span class="name">Name: ' + result[i].name + '</span>';
                html += '</div>';
            }
            $('#holidayModal .modal-body').html(html);

        },

        error: function (err) {
            console.log("Error: ", err);
        }
    });
}

$('#selectCountry').change(publicHolidays);






// Earthquake and Place of interest markers

let overlay = L.markerClusterGroup();
let earthquake = L.featureGroup.subGroup(overlay);
let placesOfInterest = L.featureGroup.subGroup(overlay);

overlay.addTo(myMap);

// Adding the cluster group to the overlay drop down menu

layerControl.addOverlay(earthquake, "Earthquake");
layerControl.addOverlay(placesOfInterest, "Place of Interest");

// Getting the overlay markers based on the country selected

function displayEarthquakeMarkers(countryCode) {
    earthquake.clearLayers();

    $.ajax({
        url: "libs/php/getCoordinates.php",
        type: 'POST',
        dataType: 'json',
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
                type: 'POST',
                dataType: 'json',
                data: {
                    north: north,
                    south: south,
                    east: east,
                    west: west
                },
                success: function (result) {
                    if (result.status.name == "ok") {

                        let earthquakes = result.data

                        for (let i = 0; i < earthquakes.length; i++) {

                            let lat = result.data[i].lat;
                            let lng = result.data[i].lng;
                            let mag = result.data[i].magnitude;
                            let depth = result.data[i].depth;

                            earthquakeIcon = L.ExtraMarkers.icon({
                                icon: 'fas fa-globe-americas fa-2x',
                                markerColor: 'orange',
                                iconColor: 'black',
                                shape: 'circle',
                                prefix: 'fa'
                            });


                            let earthquakes = L.marker([lat, lng], { icon: earthquakeIcon });

                            earthquakes.bindPopup('<div class="popup-header"><b>Earthquake</b></div>'
                                + '<div class="popup-coordinates">Coordinates: (' + lat.toFixed(4) + ', ' + lng.toFixed(4) + ')</div>'
                                + '<hr class="m-2">'
                                + '<div class="popup-magnitude">Magnitude: ' + mag + '</div>'
                                + '<div class="popup-depth">Depth: ' + depth + ' km</div>'
                                , { 'className': 'custom-popup' });


                            earthquake.addLayer(earthquakes);

                        }

                    };
                }, error: function (jqXHR, textStatus, errorThrown) {
                    console.log("ERROR")
                },
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("ERROR")
        }
    });
}

function displayPlaceOfInterestMarkers(countryCode) {
    placesOfInterest.clearLayers();

    $.ajax({
        url: "libs/php/getCoordinates.php",
        type: 'POST',
        dataType: 'json',
        data: {
            countryCord: countryCode
        },
        success: function (result) {
            let north = result.data.geonames[0].north;
            let east = result.data.geonames[0].east;
            let south = result.data.geonames[0].south;
            let west = result.data.geonames[0].west;

            //Place of interest

            $.ajax({
                url: "libs/php/getPlacesOfInterest.php",
                type: 'POST',
                dataType: 'json',
                data: {
                    north: north,
                    south: south,
                    east: east,
                    west: west
                },
                success: function (result) {
                    if (result.status.name == "ok") {

                        placesOfInterest.clearLayers();

                        for (let i = 0; i < result.data.length; i++) {
                            (function () {
                                let lat = result.data[i].lat;
                                let lng = result.data[i].lng;
                                let wiki = result.data[i].wikipediaUrl;
                                let title = result.data[i].title;

                                let icon = L.ExtraMarkers.icon({
                                    icon: 'fas fa-map-marker fa-3x',
                                    markerColor: 'blue',
                                    iconColor: 'red',
                                    shape: 'circle',
                                    prefix: 'fa'
                                });

                                let placeOfInterest = L.marker([lat, lng], { icon: icon });

                                placeOfInterest.bindPopup('<b>' + title + '</b><br>'
                                    + '(' + lat.toFixed(4) + ', ' + lng.toFixed(4) + ')<hr class="m-2">'
                                    + '<br>' + `<a target="_blank" style="color:black; text-decoration:none;" href="//${wiki}">More information</a>`
                                    , { 'className': 'custom-popup' });

                                placesOfInterest.addLayer(placeOfInterest);
                            })();

                            if (i > 30) break;
                        }
                    };
                }, error: function (jqXHR, textStatus, errorThrown) {
                    console.log("ERROR")
                },
            });

        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("ERROR")
        }
    });
}
