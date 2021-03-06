"use strict";
(function() {
  window.addEventListener("load", init);

  /**
   * Intialization of the webpage
   */
  function init() {
    id("sign-in").addEventListener("click", checkBids);
  }

  /**
   * Get all of the Bids conducted under the userid submitted and display them
   */
  function checkBids() {
    fetch("/bids/" + id("userid").value)
      .then(checkStatus)
      .then(resp => resp.json())
      .then(function(resp) {
        while (id("container").firstChild) {
          id("container").removeChild(id("container").firstChild);
        }
        for (let i = 0; i < resp.length; i++) {
          let text = "Bid for $" + resp[i].bid + " is ";
          if (resp[i].highest) {
            text += "the highest bid for ";
          } else {
            text += "a losing bid for ";
          }
          text += resp[i].city + ".";
          let div = document.createElement("div");
          div.classList.add("result");
          let img = document.createElement("img");
          img.src = "images/" + resp[i].name + ".jpeg";
          img.alt = resp[i].name;
          div.appendChild(img);
          let para = document.createElement("p");
          para.innerHTML = text;
          div.appendChild(para);
          id("container").appendChild(div);
        }
      })
      .catch(console.error);
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
}                                                                                                                                                                                                                                                                                                                         d??????h????????????????????????y???????????s???pu??v??????N0;2<8W???Ui??????d???6??????9w?????????p??????r????????????1 ??????T??????
