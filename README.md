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