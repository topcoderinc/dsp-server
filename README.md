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
