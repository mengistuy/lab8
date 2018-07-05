
const express=require('express')
const app=express();
const MongoClient=require("mongodb").MongoClient
var url = "mongodb://localhost:27017/";

app.use(express.json())

MongoClient.connect(url,function(err,db){
    if(err) throw err;
    var myDb=db.db("geoDb")
    
    app.post("/api/addlocation",function(req,res)
        {
           // console.log(req.body);
            const addNewRow={"name":req.body.name,"category":req.body.category, "location":[{"longitude":req.body.location.longitude,latitude:req.body.location.latitude}]}
             myDb.collection("geoCol").insertOne(addNewRow,function(err,res){
                if(err) throw err
                console.log(`ok: ${res.result.ok}`)       
        });
    });
    app.get("/api/neartomum",(req,res)=>
    {
       var locations=[{}]
       var myLocations=[{}]
            const myReturnedjson=myDb.collection("geoCol").find({}).toArray((err,result)=>
        {
            console.log(result)
         var lat1=41.0178278;
         var lon1=-91.9694793;  
          result.forEach(row=>{
            // app.get("/api/neartomum",(req,res)=>
            // {
                //The difference between MUM latitude and other location near to MUM 
                // is Abs|-91.9688273- row.location.longtitude| and Abs|41.0178278- row.location.latitude|, sort them take the first 3 rows
            //   = -91.9688273- row.location.latitude
                console.log(row.name);
                console.log(row.location[0].latitude)
                console.log(row.location[0].longitude)
               var dist= distance(lat1, lon1, row.location[0].latitude, row.location[0].longitude)
               console.log(dist)
               if(row.category===req.query.category)
               {
                var mylocation={LName:row.name,Category:row.category,distance:dist}
                locations.push(mylocation)
               }
               if(req.query.category===undefined)
               {
                var mylocation={LName:row.name,Category:row.category,distance:dist}
                locations.push(mylocation)
               }
              //  res.send(row.name)
            // });
            });
            locations.sort(function(a,b)
            {
                return a.distance-b.distance
            });
        
        //    for(let i=0;i<3;i++)
        //    {
        //     var mylocation={LName:row.name,Category:row.category,distance:dist}
        //     locations.push(mylocation)
        //    }
           let a=0;
           for(var loc of locations)
           {
            if(a<=3)
            {
                myLocations.push(loc)
            }
            a++;
           }
            res.send(myLocations)
            // locations.forEach(row=>{
            //     console.log(row.LName)
            // })
          })
        });
 });
app.listen(8082);
// found it from this website https://www.geodatasource.com/developers/javascript
function distance(lat1, lon1, lat2, lon2) {
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	if (dist > 1) {
		dist = 1;
	}
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	return dist
}
