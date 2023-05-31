
$(document).ready(function () {
    $(".preloader").fadeOut("slow");
    $('select').removeAttr('hidden');

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

let layerControl = L.control.layers(mapBaseLayers, null, { position: 'topleft' });
layerControl.addTo(myMap);

// Zoom and scale of the map

L.control.zoom({ position: 'topright' }).addTo(myMap)
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
      icon: 'fa-usd',
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
        $("#weatherModal").modal("show");
        weatherForecast();
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
      icon: '<i class="fa-brands fa-wikipedia-w"></i>',
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

            $("#baseCurrencyCode").text("Base Currency Code: " + baseCurrencyCode);
            $("#baseCurrencyName").text("Base Currency Name: " + baseCurrencyName);
            $("#convertedCurrencyCode").text("Country Currency Code: " + convertedCurrencyCode);
            $("#convertedCurrencyName").text("Country Currency Name: " + convertedCurrencyName);
            $("#conversionRate").text("Conversion Rate: " + conversionRate);
            $("#amountToConvertLabel").text("Amount in " + convertedCurrencyName + ":");

            // Clears the 0 when user clicks on input field
            $("#amountToConvert").focus(function () {
                $(this).val('');
            });

            $("#convertBtn").click(function () {
                let amountToConvert = $("#amountToConvert").val();
                let convertedAmount = (amountToConvert / conversionRate).toFixed(2);  // Adds only 2 digits after decimal point
                $("#convertedAmount").text("Converted Amount: " + convertedAmount + " " + baseCurrencyName);
            });

            $("#currencyModal").modal("show");
        },
        error: function (err) {
            console.log("Error: ", err);
        }
    });


    // Function to clear the input field and result when you close modal so you can do another conversion without the need to refresh the page.
    $("#currencyModal").on("hidden.bs.modal", function () {
        $("#amountToConvert").val('0');
        $("#convertedAmount").text('');
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
            let holidays = result;

            let tableHtml = '<table class="table">';
            tableHtml += '<thead><tr><th>Date</th><th>Name</th></tr></thead>';
            tableHtml += '<tbody>';

            for (let i = 0; i < holidays.length; i++) {
                tableHtml += '<tr>';
                tableHtml += '<td>' + holidays[i].date + '</td>';
                tableHtml += '<td>' + holidays[i].name + '</td>';
                tableHtml += '</tr>';
            }

            tableHtml += '</tbody></table>';

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



$('#selectCountry').change(publicHolidays);

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

// Earthquake and Place of interest markers

let overlay = L.markerClusterGroup({
    iconCreateFunction: function (cluster) {
        return L.divIcon({
            html: '<div><span>' + cluster.getChildCount() + '</span></div>',
            className: 'my-cluster-icon',
            iconSize: L.point(40, 40)
        });
    }
});


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
                                markerColor: 'red',
                                iconColor: 'white',
                                shape: 'penta',
                                prefix: 'fa',
                                extraClasses: 'my-extra-class'
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
                                    icon: 'fas fa-map-marker-alt fa-3x',
                                    markerColor: 'blue',
                                    iconColor: 'grey',
                                    shape: 'circle',
                                    prefix: 'fa',
                                    extraClasses: 'my-interest-marker-class'
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
