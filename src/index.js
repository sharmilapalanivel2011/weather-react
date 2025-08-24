import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import axios from "axios"


const root = ReactDOM.createRoot(document.getElementById('root'));

function Weather()
{
    const [city,setcity] = useState(" ")
    const [weather,setweather] = useState("")
    const [temp,settemp] = useState("")
    const [desc,setdesc] = useState("")


    function handleCity(evt)
    {
      setcity(evt.target.value)
    }

    function getWeather(){
      var weatherData = axios(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=fe949b96200365f6e9ffcb6a8f64e09e`)
    
   weatherData.then(function(success){
    console.log(success.data)
    setweather(success.data.weather[0].main)
    setdesc(success.data.weather[0].description)
    settemp(success.data.main.temp)

   })
  }
  return(<div className='box'>
  <h1 className='title'>Weather Report</h1>
  <p>I can give you a weather report about your city !</p>
  <input onChange={handleCity} className='input'></input><br></br ><br></br>
   <button onClick={getWeather}>Get Report</button>
  <p className='para'>Weather:{weather}</p>
  <p className='para'>Temperature:{temp}</p>
  <p className='para'>Description:{desc}</p>


</div>)
}
root.render(
  <div>

  <Weather></Weather>
  </div>
)

