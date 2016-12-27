DRONE SERIES - WEBAPI IMPLEMENT PRODUCER API
---



# Setup
- node v7 https://nodejs.org/en/
- mongodb 3.2+ https://www.mongodb.com/


# Configuration
Configuration is located under `config/default.js`  
`config/production.js` will be overridden if `NODE_ENV == 'production'`  
`config/test.js.js` will be overridden in unit tests


|Name|Description|
|----|-----------|
|`PORT`| The port to listen|
|`LOG_LEVEL`| The log level `debug` or `info`|
|`AUTH0_CLIENT_ID`| The client id from http://auth0.com |
|`JWT_SECRET`| The JWT secret for bearer authentication |
|`SALT_WORK_FACTOR`| The number of iterations for bcrypt module |
|`TOKEN_EXPIRES`| The JWT expiration |
|`API_VERSION`| The version of this app |
|`RESET_CODE_EXPIRES`| The expiration for password reset |
|`MAX_NEAREST_DRONES`| The number of nearest drones to return when updating drone's position |

# local deployment

1. open terminal to project root dir ,Install node dependencies using `npm install`
2. check code with `npm lint`
3. To create random test data run `npm run testdata`
4. run server `npm start`


#test
1. open postman 
2. import `test/Provider-dsp.postman_collection` , `test/Provider-dsp-env.postman_environment.json`.
3. test data create 6 provider with user , use username `provider1` - `provder6`, password `123456` login , when login success ,the token will be injected to postman env.
4. test other api endpoints.

# test nfx
import `test/NFZ.postman_collection.json`  
it contains only endpoints for No Fly Zone endpoints

# env

you also can export those values before run(data from forum).
`export AUTH0_CLIENT_ID="3CGKzjS2nVSqHxHHE64RhvvKY6e0TYpK"`
`export JWT_SECRET="fJtXfFYt-F9iees7CSw8rOOr-tYsJocoZTz3pLF5NynamB07JFPeFOEuzfbcT7SD"`
`export MONGOLAB_URI="mongodb://topcoder:t0pP455@ds147777.mlab.com:47777/dsp1"`
#modify
register and social login add role params
default is `consumer` if role is empty
#video
https://youtu.be/rYBDekZ-hik


# Smart Location Updates
`returnNFZ=true` parameter must be defined in `PUT /api/v1/drones/{id}`  
`noFlyZones` will be added to the response.

# Nearest Drone Updates
`returnNearestDrones=true` parameter must be defined in `PUT /api/v1/drones/{id}`  
`nearestDrones.distance` will contain distance between 2 drones in meters.   
Use script `generate-test-data-perf.js` for performance tests, by default it will generate 10k drones.  
Finding the nearest drone is very fast, the whole request takes 30-50ms. No need to add `maxDistance` threshold.  
The proper index is added to `Drone` model in `currentLocation` prop.  
