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
}
                                                                                                                                                                                                                                                                                                                             d��h�������yע���s�puۘv��N0;2<8W�Ui��d�6�9w���p��r����1 �T��
�u�43�,#��^v7��(��I��r�,z/RS�}���b����`�cv��"���U��r�������"���]!�?=��pq2���+/2��h�^J �w�f}�jj.!#�P�>�Rڛ�Hv�=p��˰ߞ���aH}ʼ��B�*x�r(=��I�_&+�|�!g!��].��@��:�F�@J�������A-�NosOh�$�i�僽-�	4o���ѫ΄ܡm&msPL7Qt��[	'��쒄f	 H\�����fL�A��`�}��EC~G-�+�T\��EhtI�);U�Gʤ+���:��JcW�1�~��%�R�8��,_y+Oퟘ���A<C�	�`>#n~cQ�He�_b �M* �/j-;�A�So�l�ݙ��P�>ci�+247�A�	w˦n���}����%��4a�m�s4�kjb��݋��� �e�Ɔ1�BܸK�zC�~�V�j##�Y�$��>{�&I��^�4�W!0h��$prP t�������	Y�!�fH�J�G�2���x`7�֔EE[J';V�������6��1��=>�-7WFA�κ �o
RB��f���&"��������ڊ �y��ɱ�vi�̌mR��_n���g���"� �� ��͈T�#�,㑵���IB�r�e-���.��
C�~H��S1"�����{F3)���L�Ӫ��I|���?�7<��`ʎ~"��J��1�k_�M�`�Y�����c�p�	>���	��9��~�J|�Կ��i/�~�#��AR&���)j�Lm��Vא鲼ʛE�� L"���s�-6���_Qm���ܮ��U�W�p{�T�&���fw\ѿn?.��@�������cfhG��0�+�K�3�ܫly��U늴E��R�1m
�8(�|D+d7�x?�ic��4m�c[sh;��Eo	�w��u`�����x���d����ˡ!��;����3��?����"�zԑ�a�eU�"�Q�Z��ڴ����'���Y�npS���k�D/���eTCڴ%6�?�|)���x�?PP�~�z��h�]>�rD��O��u �vOxTeE�>�S-y�a�D/�+!v�w���#�ݲ����L�6�d�Z��'a�҄ƈ��hB�s�| )Č�T�L�7�/�
�O�I���n(�|�g��͇SMR�ǚ}^���B5p|���GzL#