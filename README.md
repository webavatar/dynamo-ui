# Dynamo UI

Current Version: 1.0.0

## Introduction
Dynamo UI is a simple UI for managing DynamoDB local databases. 

## Features
1. Shows all databases
2. All defined attributes on any table
3. Shows all global secondary indexes on a given table
4. Fetch all items in the table
5. Fetch all items for a given index
6. Update Item

## Steps
1. First step is to install dynamodb locally. Steps on setting up DynamoDB locally can be found here https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html
2. Check that DynamoDB Loacl is running at http://localhost:8000/
3. Install node ( v12 or higher)
4. Checkout this repo locally 
5. Run the application locally running below command:
    node index.js
6. The UI can be accessed by navigating to http://localhost:9001/pages/index.html

In case you do not have dynamodb local running at http://localhost:8000/ then you must use a local proxy to divert request to the other server running at any host/port, for example http://192.168.1.100:8010 etc

You can check references for sample local proxy

## Online without installation !
You may also use the online version of the application which is available here 
[DynamoUI](https://webavatar.github.io/dynamo-ui/pages/index.html)

## Upcoming
1. Queries

### Who am I ? 
I am a cloud enthusiast and like exploring new technologies - AWS, DynamoDB, React and Vue are a few of them!

### Why this tool ? 
I could not find the all the features I was looking for in another tool! 

### References
[AWS Dynamo DB](https://aws.amazon.com/pm/dynamodb)
[Local CORS Proxy](https://www.npmjs.com/package/local-cors-proxy)













