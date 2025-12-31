Npm install allows you to install some petty cool stuff like drag and drop functionality, type writter and three js smoky gradient, but it can also do a lot on it's own.

After uploadeing pathific.

Take it slow, i mean start from pathific dir alone, 

then spring intializer alone then, 

docker integration with postgres db and containerized db setup (incuding how to connect it to vscode db extension), 

then a simple test to ensure all of the are working well --a hello that works end to end, then we can proceed to auth then the other modules.


## Explainer ++ trouble shooting

I need some clarification before we proceed. Is the databse created from a docker managed image pulled by docker? Is the command to connect to this docker run postgres db not on my local able to be accessed from vscode db extensions (clarify host.port.username.pasword.db.and docker execution command)? Finally should welcome page come first or should auth? Bare in mind there sanity check ok, but mdificationlead to error:"lsetga@lsetga:~/Advance/ambrosia/pathific$ curl http://localhost:8080/hello
curl http://localhost:8080/actuator/health
Hello, Pathific!{"groups":["liveness","readilsetga@lsetga:~/Advance/ambrosia/pathific$ docker compose -f ops/docker/docker-compose.yml up --build -dose.yml up --build -d
open /home/lsetga/Advance/ambrosia/pathific/ops/docker/docker-compose.yml: no such file or directory"