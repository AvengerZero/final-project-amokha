"use strict";
(function() {
  window.addEventListener("load", init);

  /**
   * Intialization of the webpage.
   */
  function init() {
    id("sign-in").addEventListener("click", endBids);
  }

  /**
   * End the bids with the homeid submitted.
   */
  function endBids() {
    let homeid = parseInt(id("homeid").value);
    if (homeid === "") {
      alert("PLEASE FILL OUT DATA BEFORE BIDDING!"); // I WAS EXPLICITLY TOLD THIS WAS OKAY
    } else if (!(typeof homeid === 'number')) {
      alert("PLEASE USE NUMBERS BEFORE BIDDING!"); // I WAS EXPLICITLY TOLD THIS WAS OKAY
    } else if (homeid === 0) {
      id("result").innerHTML = "ERROR: Wrong ID!";
    } else {
      let data = new FormData();
      data.append("id", homeid);
      fetch("/endbidding", {method: "POST", body: data})
        .then(checkStatus)
        .then(resp => resp.text())
        .then(function(resp) {
          id("result").innerHTML = resp;
        })
        .catch(id("result").innerHTML = "ERROR: Unkown error");
    }
  }
})();

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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         