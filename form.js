const express=require("express");
const bodyParser=require("body-parser");
var navigator=require("navigator");
const https = require("https");
const request = require("request");
const mapboxgl=require("mapbox-gl");
const neo4j=require("neo4j-driver");

var driver = neo4j.driver(
  "bolt://18.204.14.182:33365",
  neo4j.auth.basic("neo4j", "vacuums-feed-secrets")
);






var session = driver.session();





const app=express();
app.use(bodyParser.urlencoded({extended:true}));

let latitude,longitude, addr=" ",UserData;



// const reversegeocodingurl =
//   "https://api.mapbox.com/geocoding/v5/mapbox.places/-122.463%2C%2037.7648.json?access_token=pk.eyJ1Ijoia2FwaWxiaGlzZSIsImEiOiJja2c3anZpeTkwNGM3MnhvM3oxZ2RmMjQ0In0.9T4RHnjI16enI8S3MqNjXQ";


// const reverseGeocoding = function (latitude, longitude) {
//     var url =
//       "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
//       longitude +
//       ", " +
//       latitude +
//       ".json?access_token=" +
//       "pk.eyJ1Ijoia2FwaWxiaGlzZSIsImEiOiJja2c3anZpeTkwNGM3MnhvM3oxZ2RmMjQ0In0.9T4RHnjI16enI8S3MqNjXQ";

//     request({ url: url, json: true }, function (error, response) {
//       if (error) {
//         console.log("Unable to connect to Geocode API");
//       } else if (response.body.features.length == 0) {
//         console.log(
//           "Unable to find location. Try to" + " search another location."
//         );
//       } else {
//         console.log(response.body.features[0].place_name);

//         addr = response.body.features[0].place_name;
//         return addr;
//       }
      
//     });
// }; 
//reverseGeocoding(19.75, 75.71);



app.get("/",function(req,res){

    // const address=reverseGeocoding(19.75, 75.71);
    // console.log(address);
    res.sendFile(__dirname+"/form.html");
});


app.post("/",function(req,res){
  var url =
    "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
    req.body.mylongitude +
    ", " +
    req.body.mylatitude +
    ".json?access_token=" +
    "pk.eyJ1Ijoia2FwaWxiaGlzZSIsImEiOiJja2c3anZpeTkwNGM3MnhvM3oxZ2RmMjQ0In0.9T4RHnjI16enI8S3MqNjXQ";

  request({ url: url, json: true }, function (error, response) {
    if (error) {
      console.log("Unable to connect to Geocode API");
    } else if (response.body.features.length == 0) {
      console.log(
        "Unable to find location. Try to" + " search another location."
      );
    } else {
      addr = String(response.body.features[0].place_name);
      console.log(response.body.features[0].place_name);
      //console.log("hi "+addr);
      
      return addr;
    }
  });

  //const Address=reverseGeocoding(req.body.mylatitude, req.body.mylongitude);
  //console.log("Hello",Address);

  
  setTimeout(function () {
    UserData = {
      name: req.body.inputName,
      surname: req.body.inputSurname,
      latitude: req.body.mylatitude,
      longitude: req.body.mylongitude,
      address: addr,
    };
    console.log(UserData);
    // var param={
    //   "nameParam":UserData.name, 
    //   "surnameParam":UserData.surname, 
    //   "latitudeParam":UserData.latitude, 
    //   "longitudeParam":UserData.longitude, 
    //   "addressParam":UserData.address
    // };
    // var q='CREATE (n:Person {
    //       Name:{nameParam}, 
    //       Surname:{surnameParam},
    //       Lat:{latitudeParam},
    //       Lon:{longitudeParam},
    //       Address:{addressParam} }) RETURN (n)';
    var params = {
      nameParam: UserData.name,
      surnameParam: UserData.surname,
      latitudeParam: UserData.latitude,
      longitudeParam: UserData.longitude,
      addressParam: UserData.address,
    };

    var query =
      "Create (n:Person { Name:{nameParam}, Surname:{surnameParam}, Lat:{latitudeParam}, Lon:{longitudeParam}, Address:{addressParam} })  RETURN (n) ";

    session
      .run(query,params)
      .then(function (result) {
        // result.records.forEach(function (record) {
        //   console.log(record);
        // });
        console.log(result);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, 3000);
  
  res.send(UserData);
  
});

app.listen(3000,function(){
    console.log("listening at port 3000");
});



