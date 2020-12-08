const express=require("express");
const bodyParser=require("body-parser");
var navigator=require("navigator");
const https = require("https");
const request = require("request");
const mapboxgl=require("mapbox-gl");
const neo4j=require("neo4j-driver");
const path=require("path");
var logger = require("morgan");


var driver = neo4j.driver(
  "bolt://18.207.141.59:34122",
  neo4j.auth.basic("neo4j", "injury-rowers-swing")
);

var session = driver.session();

const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(logger("dev"));
app.use(bodyParser.json());

let latitude,longitude, addr=" ", UserData, HospitalData;

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

const forwardGeocoding = function (address) { 
  
    var url = "https://api.mapbox.com/geocoding/v5/mapbox.places/"+"encodeURIComponent(address)"+".json?access_token=pk.eyJ1Ijoia2FwaWxiaGlzZSIsImEiOiJja2c3anZpeTkwNGM3MnhvM3oxZ2RmMjQ0In0.9T4RHnjI16enI8S3MqNjXQ&limit=1"; 
  
    request({ url: url, json: true }, function (error, response) { 
        if (error) { 
            callback('Unable to connect to Geocode API', undefined); 
        } else if (response.body.features.length == 0) { 
            callback('Unable to find location. Try to '
                     + 'search another location.'); 
        } else { 
  
            var longitude = response.body.features[0].center[0] 
            var latitude = response.body.features[0].center[1] 
            var location = response.body.features[0].place_name 
  
            console.log("Latitude :", latitude); 
            console.log("Longitude :", longitude); 
            console.log("Location :", location); 
            return latitude, longitude;
        } 
    }) 
} 

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
    let params = {
      nameParam: UserData.name,
      surnameParam: UserData.surname,
      latitudeParam: UserData.latitude,
      longitudeParam: UserData.longitude,
      addressParam: UserData.address,
    };

    let query =
      "Create (n:Person { Name:{nameParam}, Surname:{surnameParam}, Lat:{latitudeParam}, Lon:{longitudeParam}, Address:{addressParam} })  RETURN (n) ";

    session
      .run(query,params)
      .then(function (result) {
        // result.records.forEach(function (record) {
        //   console.log(record);
        // });
        //console.log(result);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, 3000);
  
  res.send(UserData);
  
});

app.get("/add", function (req, res) {
  res.sendFile(__dirname + "/add_hospital.html");
});

app.post("/add",function(req, res){
  // let latitude=0,longitude=0, location="";
  // let address=req.body.locality;
  // var url =
  //   "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
  //   "encodeURIComponent(req.body.inputDistrict)" +
  //   ".json?access_token=pk.eyJ1Ijoia2FwaWxiaGlzZSIsImEiOiJja2c3anZpeTkwNGM3MnhvM3oxZ2RmMjQ0In0.9T4RHnjI16enI8S3MqNjXQ&limit=1";

  // request({ url: url, json: true }, function (error, response) {
  //   if (error) {
  //     console.log("Unable to connect to Geocode API", undefined);
  //   } else if (response.body.features.length == 0) {
  //     console.log("Unable to find location. Try to " + "search another location.");
  //   } else {
  //     response.body.features[0].center[0];
  //     response.body.features[0].center[1];
  //     response.body.features[0].place_name;

  //     console.log("Latitude :", latitude);
  //     console.log("Longitude :", longitude);
  //     console.log("Location :", location);
  //     return latitude, longitude;
  //   }
  // }); 
  //forward geocoding "https://api.mapbox.com/geocoding/v5/mapbox.places/515%2015th%20St%20NW%2C%20Washington%2C%20DC%2020004.json?types=address&access_token=pk.eyJ1Ijoia2FwaWxiaGlzZSIsImEiOiJja2c3anZpeTkwNGM3MnhvM3oxZ2RmMjQ0In0.9T4RHnjI16enI8S3MqNjXQ"
  //let [lat,lng]=forwardGeocoding(req.body.locality);
  //console.log(forwardGeocoding("Matunga"));

  HospitalData = {
    hospitalName: req.body.inputHospitalName,
    hospitalCareType: req.body.inputHospitalCareType,
    email: req.body.inputEmail,
    locality: req.body.inputLocality,
    telephone: req.body.inputTelephone,
    pincode: req.body.inputPincode,
    address: req.body.inputAddress,
    district: req.body.inputDistrict,
  };
  console.log(HospitalData);
  var params = {
    hospitalNameParam: HospitalData.hospitalName,
    hospitalCareTypeParam: HospitalData.hospitalCareType,
    emailParam: HospitalData.email,
    localityParam: HospitalData.locality,
    telephoneParam: HospitalData.telephone,
    pincodeParam: HospitalData.pincode,
    addressParam: HospitalData.address,
    districtParam: HospitalData.district,
  };
  let query =
    "Create (n:Hospital { Name:{hospitalNameParam}, hospitalCareType:{hospitalCareTypeParam}, email:{emailParam}, locality:{localityParam}, telephone:{telephoneParam}, pincode:{pincodeParam}, address:{addressParam}, district:{districtParam}})  RETURN (n) ";

  session
    .run(query, params)
    .then(function (result) {
      // result.records.forEach(function (record) {
      //   console.log(record);
      // });
      //console.log(result);
    })
    .catch(function (error) {
      console.log(error);
    });

  res.send(HospitalData);
});

app.listen(3000,function(){
    console.log("listening at port 3000");
});



