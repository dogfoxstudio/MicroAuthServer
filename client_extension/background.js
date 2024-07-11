chrome.runtime.onMessage.addListener(listener);

const server = "http://192.168.1.2:1111/auth";
//const server = "http://127.0.0.1:1111/auth";

const timeout_pattern_site = "google"

async function listener(request, sender, sendResponse) {
    console.log("Token: "+request.token);
    let {url, loginfield, passwordfield,login, password, succeed} = await getAuth(request.token);
    console.log("Succeed: "+succeed);
    if (succeed) {    
        console.log(url+":"+login+":"+password);
        Login(url, loginfield, passwordfield, login, password);
    } else {
        console.log("Wrong token! Try again");
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
post = function(url, data) {
    return fetch(url, {method: "POST", headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)});
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function getAuth(token) {
    return new Promise( ( resolve, reject ) => {
        post(server, {"token":token})
        .then(res => res.json())
        .then(data => {
            resolve({url:data.url, loginfield:data.loginfield, passwordfield:data.passwordfield,login:data.login, password:data.password, succeed:data.succeed});
        })
        .catch(error => {
            console.log("Server error")
            console.log(error)
            resolve({login:"Server Error", password:"", succeed:false});
        });
    });
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function Login(link, loginfield, passwordfield, login, password) {
    console.log(link)
    let tab = await chrome.tabs.create({active:true,url:link});
    //console.log("Inserted:"+login+":"+password);
    return new Promise( ( resolve, reject ) => {
        if (link.includes(timeout_pattern_site)) {
            setTimeout(()=>{chrome.scripting.executeScript({ target : {tabId : tab.id}, func : loginInjection, args : [ login, password, loginfield, passwordfield ]});},6000)
            console.log("It is Stripchat, adding timeout")
        } else {
            chrome.scripting.executeScript({ target : {tabId : tab.id}, func : loginInjection, args : [ login, password, loginfield, passwordfield ]});
        }
    } );
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function loginInjection(login, password, loginfield, passwordfield) {
    function getElementByXPath(path) {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }
    
    function setvalue(login,password, loginfield, passwordfield) {
        return new Promise( ( resolve, reject ) => {
            document.getElementById(loginfield).value = login;
            document.getElementById(passwordfield).value = password;
            resolve();
        } )
    }
    function submit() {
        getElementsByXPath("/html/body/div[1]/div[3]/div/div/form/input[3]").click();
        alert("Submitting")
    } 
    setvalue(login,password, loginfield, passwordfield);
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////