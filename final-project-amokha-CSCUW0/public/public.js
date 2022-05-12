"use strict";
let map;

/**
 * Intializes the Map for the Google Doc.
 * Gets each Marker in the marker sql file that has not been taken off the market and puts it on
 * the map.
 * Each marker is then given a function to give the page information about the house when clicked.
 * JSlint says it is never called but it is part of a callback in the HTML.
 */

function myMap() {
  let mapProp = {center: new google.maps.LatLng(47.6202845, -122.3499868, 17), zoom: 4};
  map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
  fetch("/markers")
    .then(checkStatus)
    .then(resp => resp.json())
    .then(function(resp) {
      let marker = [];
      for (let i = 0; i < resp.length; i++) {
        let lat = resp[i].latitude;
        let long = resp[i].longitude;
        let position = {lat: parseFloat(lat), lng: parseFloat(long)};
        marker.push(new google.maps.Marker({position: position, map: map, title: "i"}));
        marker[i].addListener("click", function() {
          map.setZoom(15);
          map.setCenter(marker[i].getPosition());
          appear("selected");
          fetch("/info/" + resp[i].id)
            .then(checkStatus)
            .then(resp => resp.json())
            .then(resp => createHomeInfo(resp))
            .catch(console.error);
        });
      }
    })
    .catch(console.error);
}

(function() {
  window.addEventListener("load", init);

  /**
   * Intialization of the webpage.
   */
  function init() {
    id("hide-btn1").addEventListener("click", function() {
      id("result").classList.add("hidden");
      id("reveal-btn").classList.remove("hidden");
    });
    id("hide-btn2").addEventListener("click", function() {
      id("selected").classList.add("hidden");
    });
    id("reveal-btn").addEventListener("click", function() {
      id("result").classList.remove("hidden");
      id("reveal-btn").classList.add("hidden");
    });
    id("bid-btn").addEventListener("click", startBidding);
    id("searching").addEventListener("keyup", function(event) {
      if (event.keyCode === 13) {
        searchEnter();
      }
    });
  }

  /**
   * Take the search bar and use its contents to find a list of locations that match the phrase.
   * Afterwards create entries in the search column for every location.
   */
  function searchEnter() {
    fetch("/search/" + id("searching").value)
      .then(checkStatus)
      .then(resp => resp.json())
      .then(function(response) {
        while (id("result").childNodes.length > 4) {
          id("result").removeChild((id("result").lastChild));
        }
        for (let i = 0; i < response.length; i++) {
          console.log(response[i].city);
          let text = response[i].city + ", " + response[i].state;
          let div = document.createElement("div");
          div.classList.add("result");
          let para = document.createElement("p");
          para.innerHTML = text;
          div.appendChild(para);
          para.addEventListener("click", function() {
            map.setZoom(15);
            console.log(parseFloat(response[i].latitude), parseFloat(response[i].longitude))
            map.setCenter({lat: parseFloat(response[i].latitude),
              lng: parseFloat(response[i].longitude)});
          });
          id("result").appendChild(div);
        }
      });
  }

  /**
   * Show the input boxes neccecary to start bidding for the client.
   */
  function startBidding() {
    id("bid-btn").removeEventListener("click", startBidding);
    appear("uid");
    appear("price-bid");
    appear("newuser");
    id("bid-btn").addEventListener("click", bidForHome);
  }

  /**
   * Sees if a newId is needed and then generates a new one if it has to.
   * @param {string} uid - userid as a string.
   * @return {int} int associated with useid.
   */
  async function newId(uid) {
    if (uid === 0) {
      await fetch("/newuid")
        .then(checkStatus)
        .then(resp => resp.json())
        .then(function(resp) {
          id("uid").value = "" + resp.uid;
        })
        .catch(id("uid").value = "");
      uid = parseInt(id("uid").value);
    }
    return uid;
  }

  /**
   * checks the bids and UID given for errors.
   * @param {string} uid - userid as a string.
   * @param {string} bid - bid as a string
   * @return {int} int associated with useid.
   */
  function alertUser(uid, bid) {
    if (uid === "" || bid === "") {
      alert("PLEASE FILL OUT DATA BEFORE BIDDING!");
      return false;
    } else if (!(typeof uid === 'number' && typeof bid === 'number')) {
      alert("PLEASE USE NUMBERS BEFORE BIDDING!");
      return false;
    } else {
      return true;
    }
  }

  /**
   * Take the bidding information and submit the bid to the database.
   */
  async function bidForHome() {
    let uid = parseInt(id("uid").value);
    let bid = parseInt(id("price-bid").value);
    let homeid = parseInt(id("homeid").value);
    uid = await newId(uid);
    if (alertUser(uid, bid)) {
      if (bid <= parseInt(id("price").innerHTML.substring("Price: $".length))) {
        appear("price-error");
        hide("submitted");
      } else {
        let data = new FormData();
        hide("price-error");
        data.append("uid", uid);
        data.append("bid", bid);
        data.append("id", homeid);
        fetch("/bidding", {method: "POST", body: data})
          .then(checkStatus)
          .then(resp => resp.text())
          .then(function(resp) {
            id("price").innerHTML = "Price: $" + bid;
            let people = parseInt(id("bidders").innerHTML.substring("Bidders: ".length));
            id("bidders").innerHTML = "Bidders: " + people;
            id("submitted").innerHTML = resp;
            appear("submitted");
          })
          .catch(console.error);
      }
    }
  }
})();

/**
 * @param {json} json - object of Price, Owner, Bidders, Awards, Name, url, info, id, and address
 * Takes the info from json and displays it on the page.
 */
function createHomeInfo(json) {
  id("price").innerHTML = "Price: $" + json.price;
  id("owner").innerHTML = "Owner: " + json.owner;
  id("bidders").innerHTML = "Bidders: " + json.bidders;
  id("awards").innerHTML = json.awards;
  id("home-photo").src = "/images/" + json.name + ".jpeg";
  id("link").href = json.url;
  id("info").innerHTML = json.info;
  id("homeid").value = json.id;
  id("address").innerHTML = json.address;
}

/**
 * Takes the element id and adds the hidden class.
 * @param {string} idSelector - element ID.
 */
function hide(idSelector) {
  let inverter = id(idSelector);
  inverter.classList.add("hidden");
}

/**
 * Takes the element id and removes the hidden class.
 * @param {string} idSelector - element ID.
 */
function appear(idSelector) {
  let inverter = id(idSelector);
  inverter.classList.remove("hidden");
}

// ------------------------- HELPER FUNCTIONS ------------------------- //
/**
 * Returns the element that has the ID attribute with the specified value.
 * @param {string} idName - element ID.
 * @return {object} DOM object associated with id.
 */
function id(idName) {
  return document.getElementById(idName);
}

/**
 * Helper function to return the response's result text if successful, otherwise
 * returns the rejected Promise result with an error status and corresponding text
 * @param {object} response - response to check for success/error
 * @return {object} - valid response if response was successful, otherwise rejected
 *                    Promise result
 */
function checkStatus(response) {
  if (!response.ok) {
    throw Error("Error in request: " + response.statusText);
  }
  return response; // a Response object
}
