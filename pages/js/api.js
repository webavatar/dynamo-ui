var dynamodb = new AWS.DynamoDB({
    accessKeyId: "fake",
    secretAccessKey: "fake",
    sessionToken: "fake",
    endpoint: "http://localhost:8000",
    region: 'ap-south-1'
});

function deserializer(item) {
    return AWS.DynamoDB.Converter.unmarshall(item)
}

function deserializerItems(items) {
    let its = []
    items["Items"].forEach(el => {
        its.push(deserializer(el))
    });
    return its
}

function scan(table) {
    var params = {
        TableName: table
    };
    return dynamodb.scan(params).promise()
}

function scanIndex(table, index) {
    var params = {
        TableName: table,
        IndexName: index
    };
    return dynamodb.scan(params).promise()
}

function listTables() {
    var params = {
    };
    return dynamodb.listTables(params).promise()
}

function fetchTableDetails(table) {
    var params = {
        TableName: table
    };
    return dynamodb.describeTable(params).promise()
}

function fetchDynamoTables() {

    listTables('bssnew')
        .then((data) => {
            console.log('Info is ', (data))
        }).catch((e) => {
            console.log('Error fetching table details', e)
        })

}


/**
 * 
 * @param {*} data 
 * @param {Set} mainAttrs 
 * @returns 
 */
function dynamoItemsToTable(data, keyAttrs, keyName) {

    let d = deserializerItems(data)

    let kk = new Set()
    let hh = []
    let dd = []


    let formKey = (keyAttrs, item) => {
        if (!keyAttrs)
            return "id"
        return keyAttrs.length == 1 ? item[keyAttrs[0]] : item[keyAttrs[0]] + '-' + item[keyAttrs[1]]
    }

    d.forEach((i) => {
        let obj = {
            key1: formKey(keyAttrs, i),
            ...i
        }
        dd.push(obj)
        Object.keys(obj).forEach((k) => {
            kk.add(k)
        })

    })

    keyAttrs.forEach((a) => {
        hh.push({
            text: a,
            value: a
        })
    })

    kk.forEach((k) => {
        if (!keyAttrs.includes(k)) {
            hh.push({
                text: k,
                value: k
            })
        }
    })
    return { dd, hh }
}

