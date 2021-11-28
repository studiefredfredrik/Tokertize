# nftmarathon
Chainlink hackaton 2021


## To run this project

### Start mongo-db in docker
```
docker-compose up -d
```

### Run the smart contract  
Start a Ganache local instance and install the toolchain globally    
```
cd ./src/smart-contract
truffle compile
truffle migrate --network development
```

### Install and run server
```
cd ./src
npm install
node server.js
```

### Install and run frontend
```
cd ./src/frontend
npm install
npm run serve
```  

Assuming no errors the project should now be running at localhost:8080  
with the backend running at localhost:5000  
dev server will proxy-pass all requests to /api