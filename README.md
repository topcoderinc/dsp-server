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
Some settings (e.g AWS credentials) must be set only as Environment variables. Check file custom-environment-variables.json for full list.

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
|`AWS_ACCESS_KEY`| The AWS Access Key see http://docs.aws.amazon.com/general/latest/gr/managing-aws-access-keys.html  |
|`AWS_SECRET_KEY`| The AWS Secret Key  |
|`AWS_REGION`| Your AWS access region. You should use all services from the same region (Currently only S3 is used).  |
|`S3_BUCKET`| The S3 bucket name for file upload. |

AWS settings are optional to set, but file upload will not working (you can use other features).

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
`export SMTP_HOST="smtp.gmail.com"`
`export SMTP_PORT="465"`
`export SMTP_USERNAME="youremail"`
`export SMTP_PASSWORD="yourpassword"`
`export EMAIL_FROM="your@email.com"`

# S3 setup
- Open S3 console https://console.aws.amazon.com/s3
- Create Bucket
- Check `Region Name` to `Code` mapping here http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html and set `AWS_REGION`
- Select tab **Properties** from the top right menu
- Expand **Permissions** tab
- Click on **Add bucket policy** and set below policy
```
{
  "Version": "2008-10-17",
  "Statement": [
    {
      "Sid": "AllowPublicRead",
      "Effect": "Allow",
      "Principal": {
        "AWS": "*"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::dsp-21472/*"
    }
  ]
}
```
Update `dsp-21472` to your bucket name.

- Click on **Add CORS Configuration** and set below policy
```
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
    <CORSRule>
        <AllowedOrigin>*</AllowedOrigin>
        <AllowedMethod>GET</AllowedMethod>
        <AllowedMethod>PUT</AllowedMethod>
        <AllowedMethod>POST</AllowedMethod>
        <AllowedMethod>DELETE</AllowedMethod>
        <MaxAgeSeconds>3000</MaxAgeSeconds>
        <AllowedHeader>*</AllowedHeader>
    </CORSRule>
</CORSConfiguration>


```
In production mode, you should restrict `AllowedOrigin`.