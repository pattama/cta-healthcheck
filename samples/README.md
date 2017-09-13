Sample
======

First, start [health check data service](https://git.sami.int.thomsonreuters.com/compass/cta-app-healthcheckdataservice) then open `http://localhost:8000/healthcheck?mode=full`

start app foo `node foo` then open `http://localhost:8080/healthcheck?mode=full`

start app bar `node bar` then open `http://localhost:8090/healthcheck?mode=full`

Refresh urls:

- First url is the aggregated status of all apps
- Second url is the aggregated status of app foo
- Third url is the aggregated status of app bar

