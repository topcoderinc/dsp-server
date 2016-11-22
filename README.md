Drone API's to update, create and remove drones. These API's display realtime position on a google map
---

react-app
---

Install node dependencies using `npm install`
To create dummy test data (10,000 drones) run `npm run testdata`
Run the development server using `npm run start`

The backend-server is deployed to heroku `https://backend-server-drones-spanhawk.herokuapp.com`

____________________________________________________________

WEBAPI - CONSUMER TO DSP API PRODUCT CATALOG UPDATE
---

## additional dependency
- nodemailer -- for sending reset-password email
- nodemon	-- this is a missing dev dependency as there is a "watch" script in package.json which use it 

## additional configuration
- API_VERSION -- api version management
- RESET_CODE_EXPIRES -- reset verify code expiration in seconds, 1 hour by default

## local deploy
make sure you set an environment varaible `JWT_SECRET`

	git checkout consumer
	npm i
	npm run testdata
	npm run watch

## swagger definition update
updated swagger file located at dsp-server/

- /register

	success response statusCode changed from 204 to 201, as a new resource will have been created.

- /login/social

	parameters schema changed to {"email":String, "name":String}, refer to frontend implemention, social login will pass these two fields and having an email will help to make user unique: https://github.com/topcoderinc/dsp-app/blob/master/src/components/auth/utils/AuthService.js#L41

- /reset-password

	parameters schema changed to {"email":String, "code": String, "password":String}, depends on the resetPasswordCode generation algorithm, the resetPasswordCode might not be unique, so an email is required to identify user. And add a 404 reponse for non-existed user.

- /mission/{id}/review

	success response statusCode changed from 204 to 201, as a new resource will have been created.
	
- /packages/{id}/request

	success response statusCode changed from 204 to 201, as a new resource will have been created. 

## mail setting
 An email has been configurated for sending verify code to user, note that this is an personal email and used only for testing, the pass will expired in a week.

## Postman test notes:
- import the test folder /dsp-server/test into you postman app
- /providers/{id}, /packages/{id}
	the parameter id should be replaced by the id of an entity returned in search part.
- access token will be auto set to an environment variable after login, and all user related data are refered to first user(ie. normal login user), be sure execute the normal login request before user related test.

## verification
youtube video url:  https://youtu.be/5qaLaZyIheU