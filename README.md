DRONE SERIES - WEBAPI IMPLEMENT PRODUCER API
---



# Setup
- node v7 https://nodejs.org/en/
- mongodb 3.2+ https://www.mongodb.com/

# local deployment

1. open terminal to project root dir ,Install node dependencies using `npm install`
2. check code with `npm lint`
3. To create random test data run `npm run testdata`
4. run server `npm start`

## Configuration

Configuration files are located under `config` dir.
See https://github.com/lorenwest/node-config/wiki/Configuration-Files

|Name|Description|
|----|-----------|
|`LOG_LEVEL`| The logging level for the api's|
|`PORT`| The port to listen|
|`AUTH0_CLIENT_ID`| The auth0 client id |
|`JWT_SECRET`| The jwt secret |
|`mail.SMTP_HOST`| The smtp hostname |
|`mail.SMTP_PORT`| The smtp port |
|`mail.EMAIL_FROM`| The from email address |
|`mail.SMTP_USERNAME`| The smtp username |
|`mail.SMTP_PASSWORD`| The smtp password |

## Mail service configuration

[mailgun](https://mailgun.com) is used as mail service.

- Create an account on mailgun.
- By default a sandbox domain is created. Click on sandbox domain and copy the `Default SMTP Login`
  and `Default Password` and set them as environment variables.
  export SMTP_USERNAME=<copied from mailgun sandbox domain>
  export SMTP_PASSWORD=<copied from mailgun sandbox domain>
- The host and port are configured for mailgun.


When we create an account on mailgun, by default only sandbox domain is enabled.
To successfully send email from this sandbox domain you have to add the user to authorized recipients list.

#test
1. open postman
2. import `test/Provider-dsp.postman_collection` , `test/Provider-dsp-env.postman_environment.json`.
3. test data create 6 provider with user , use username `provider1` - `provder6`, password `123456` login , when login success ,the token will be injected to postman env.
4. test other api endpoints.

# test nfx
import `test/NFZ.postman_collection.json`
it contains only endpoints for No Fly Zone endpoints

# Smart Location Updates
I added three query parameters `returnNFZ`, `nfzFields` and `nfzLimit` to API *PUT `/drones/{id}`* for getting the array of violated No fly zones in the response data.
A Sample usage to get the violated no fly zones with fields `description`, `isActive`, `isPermanent`:
    ```
    curl -X PUT -H "Content-Type: application/json"  -d '{
       	"lat":38.90709540316193,
       	"lng":-77.03920125961304
    }' "$URL/drones/5866f36af66a5654a0816991?returnNFZ=true&nfzFields=description,isActive,isPermanent"
    ```
  The response data will contain an extra field `noFlyZones`, which contains an array of `NoFlyZone` that the drone has violated.
  You could specified the returned fields of `noFlyZones` by `nfzFields` parameter. If you omit the `nfzFields`, all fields except the `location` will be returned.
  The parameter `nfzLimit` is for limit the number of returned `NoFlyZone`s, if it is omitted, then all the `NoFlyZone`s are returned.
  Note: the `_id` of the `NoFlyZone` is always returned.
The approach to get the array of violated no fly zones is based on the `NoFlyZoneService.search`, the steps are:
 1. Define the search criteria: be active, matched time, geometry is "Point" type, the point coordinate is  the drone's location.
    ```
    {
       isActive: true,
        matchTime: true,
        geometry: {
          type: 'Point',
          coordinates: drone.currentLocation,
        },
        projFields: ['circle', 'description', 'startTime', 'endTime', 'isActive', 'isPermanent', 'mission'],
    }
    ```
 2. Call `NoFlyZoneService.search` to search no fly zones. Since we only needs to get part of the fields of `NoFlyZone`, I added a field `projFields` to the search criteria. 
    The field `projFields` could search in MongoDB with projection, which helps to improve the performance.
    Additionally, the `projFields` could be overrided by `nfzFields` if it is provided.
    `nfzFields=description,isActive,isPermanent` will be converted to `['description', 'isActive', 'isPermanent']`.
 3. Retrieve the array of no fly zones from the returned object, and add the `items` field to the response of this API. It is added to the field `noFlyZones`.
# Nearest Drone Updates
I added another three query parameters `nearDronesMaxDist`, `nearDroneFields` and `nearDronesLimit` to API *PUT `/drones/{id}`* for getting the nearest drones.
A Sample usage to get 100 nearest drones within 1000 meters:
    ```
    curl -X PUT -H "Content-Type: application/json"  -d '{
       	"lat":38.90709540316193,
       	"lng":-77.03920125961304
    }' "$URL/drones/5866f36af66a5654a0816991?nearDronesMaxDist=1000&nearDronesLimit=100&nearDroneFields=currentLocation,status,name,description"
    ```
  The response data will contain an extra field `nearestDrones`. This field contains an array of `Drones` (100 at most) that are ordered by distance.
  To avoid return all fields of drones in the response data, you could specify the fields to be returned by `nearDroneFields`. The example above returns the fields `currentLocation`, `status`, `name`, `description`, `_id`.
  If the `nearDronesMaxDist` is omitted or 0, no nearest drones will be contained in the response data.
  If the `nearDronesLimit` is omitted or 0, only 1 nearest drone will be returned.
  If the `nearDroneFields` is omitted, all the fields of drones will be returned, which is not necessary. So this field is suggested to be provided.
  A new field `dist` is contained in the response data for indicating the distance (in meter) between the drone and the current drone.
  Note: the `_id` of `Drone` is always returned.
The approach to get the array of nearest drones is based on the geospatial of MongoDB. The steps are:
 1. Add the `2dsphere` index to `Drone.currentLocation`, since it is not a required field, we need to specify `sparse: true`.
 2. Rebuild the index. Since the data are for test, we could regenerate test data for rebuilding the index for simplicity.
 3. As we need to add `dist` field to the response data, we use `$geoNear` instead of `$nearSphere`.
    Set the `$geoNear` option as
    ```
    {
      near: {
        type: 'Point',
        coordinates: drone.currentLocation,
      },
      distanceField: 'dist',
      maxDistance: nearDronesMaxDist,
      spherical: true,
      query: {
        _id: { $ne: ObjectId(id) },
      },
    }
    ```
    which means to search by `Point` and filter the current drone itself.
 4. Add `limit` and `$project` according to the query parameter `nearDronesLimit`, `nearDroneFields`.
 5. Aggregate `Drone` and add returned array to the response of this API. The array is added to the field `nearestDrones`.  
# env

you also can export those values before run(data from forum).
`export AUTH0_CLIENT_ID="3CGKzjS2nVSqHxHHE64RhvvKY6e0TYpK"`
`export JWT_SECRET="fJtXfFYt-F9iees7CSw8rOOr-tYsJocoZTz3pLF5NynamB07JFPeFOEuzfbcT7SD"`
`export MONGOLAB_URI="mongodb://topcoder:t0pP455@ds147777.mlab.com:47777/dsp1"`
`export SMTP_HOST="smtp.gmail.com"`
`export SMTP_PORT="465"`
`export SMTP_USERNAME="youremail"`
`export SMTP_PASSWORD="yourpassword"`
`export EMAIL_FROM="your@email.com"`

force push 1/11/2017
