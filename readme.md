In depth, step by step explanaiton ( review ) of authentication on Node, Express from https://medium.com/@evangow/server-authentication-basics-express-sessions-passport-and-curl-359b7456003d


Curl commands 

curl -X GET http://localhost:3000 -c cookie-file.txt
// You got home page!

curl -X GET http://localhost:3000 -d cookie-file.txt
// You got home page!

curl -X GET http://localhost:3000/authrequired -b cookie-file.txt -L
// not authenticated : You got home page!
// authenticated : you hit the authentication endpoint

curl -X POST http://localhost:3000/login -b cookie-file.txt -H 'Content-Type: application/json' -d '{"email":"test@test.com", "password":"password"}'
// You were authenticated & logged in!

curl http://localhost:3000/login -c cookie-file.txt -H 
// excluded the ‘-X POST’ flag as we want cURL to follow the redirect from the /login route to the /authrequired route, which we GET. If we leave the ‘-X POST’ flag then it will try to post to the /authrequired route as well. Instead, we’ll just let cURL infer what it should do on each route.



- Curl parameters
* -L -> follow redirects
* -b <fileNameWithExt> -> send document / cookie file
* -X GET | -X POST -> get or post reoute
- c <fileNameWithExt> -> create this resource


check middleware: 
1. post login 
2. try authorization only route
