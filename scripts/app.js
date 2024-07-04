
let map;
let service;
let infowindow;
let markers = [];

var priceRange = document.getElementById("priceRange");
const sliderValue = document.getElementById('sliderValue');

priceRange.oninput = function() {
    const value = priceRange.value;
    sliderValue.textContent = '$'.repeat(value);
    markers = []
    initializeMap()
  }

async function initializeMap() {
    // Your map initialization code here
    // Initialize the map
    const { Map, InfoWindow } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    const {LatLng} = await google.maps.importLibrary("core")
    const {PlacesService} = await google.maps.importLibrary("places")

    var map_center = new LatLng(22.3211, 114.2096);

    // Add OpenStreetMap tiles as the base layer
    infowindow = new InfoWindow();
    map = new Map(document.getElementById("map"), {
      center: map_center,
      zoom: 15,
      mapId: "DEMO_MAP_ID", // Map ID is required for advanced markers.
      options: {
        gestureHandling: 'greedy'
      }
    });


    // Example: Fetch restaurants within the bounding box
    var request = {
        location: map_center,
        radius: '500',
        keyword: 'restaurant cafe',
        maxPriceLevel : priceRange.value,
        // openNow : true
      };
    
    service = new PlacesService(map);
    service.nearbySearch(request, callback);
    
    
    function callback(results, status, pagination) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          createMarker(results[i]);
        }
        if (pagination && pagination.hasNextPage) {
            getNextPage = () => {
              // Note: nextPage will call the same handler function as the initial call
              pagination.nextPage();
            };
        }else{
            getNextPage = () => {}
        }
        getNextPage()
      }
    }

    function createMarker(place) {

    if (!place.geometry || !place.geometry.location || place.business_status != 'OPERATIONAL') return;
    var photos = place.photos;
   
    
    const marker = new AdvancedMarkerElement({
        map,
        position: place.geometry.location,
        // title: place.name,
        gmpClickable: true,
    });
    
    markers.push(marker);

    marker.addListener("click", () => {
      
        //infowindow.close();

        const content = document.createElement("div");

        if (!photos) {}
        else {
            const photoElement = document.createElement("img");
            photoElement.src = photos[0].getUrl({maxWidth: 320, maxHeight: 320})
            content.appendChild(photoElement);
        }

        const nameElement = document.createElement("h2");
        nameElement.textContent = place.name;
        content.appendChild(nameElement);

        const placeAddressElement = document.createElement("p");
        placeAddressElement.textContent = place.vicinity;
        content.appendChild(placeAddressElement);

        const placeUrl = document.createElement("a");
        placeUrl.setAttribute('href','https://www.google.com/maps/place/?q=place_id:' + place.place_id);
        placeUrl.innerHTML = 'Google Map Link';
        content.appendChild(placeUrl);

        infowindow.setContent(content);
        infowindow.open(map, marker);
        console.log(place.name)
      });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Assuming you have an array of markers called 'markers'
    const randomMarkerButton = document.getElementById('randomRestaurant');
    randomMarkerButton.addEventListener('click', showRandomMarker);
    initializeMap()
});

function showRandomMarker() {
    // Get a random index within the range of your markers array
    const randomIndex = Math.floor(Math.random() * markers.length);

    // Trigger the click event for the randomly selected marker
    google.maps.event.trigger(markers[randomIndex], 'click');
}