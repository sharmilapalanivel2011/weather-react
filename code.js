const axios = require("axios")

var data = axios("https://api.openweathermap.org/data/2.5/weather?q=london&appid=fe949b96200365f6e9ffcb6a8f64e09e")

data.then(function(userdata)
{
    console.log(userdata.data.weather[0].main)
}).catch(function(errmsg){
    console.log("couldnot get result")
})