var dynamodb = undefined


function init(config) {
    dynamodb = new AWS.DynamoDB(config);
}


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

function saveTableItem(table, item) {
    var params = {
        Item: AWS.DynamoDB.Converter.marshall(item),
        TableName: table
    };
    return dynamodb.putItem(params).promise()
}

function deleteTableItem(table, key) {
    var params = {
        Key: AWS.DynamoDB.Converter.marshall(key),
        TableName: table
    };
    return dynamodb.deleteItem(params).promise()
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

    console.debug('Mapping Items to Table', keyAttrs)

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

    hh.push({
        text: 'Key',
        value: "key1"
    })

    keyAttrs.forEach((a) => {
        hh.push({
            text: a,
            value: a
        })
    })

    kk.forEach((k) => {
        if (!keyAttrs.includes(k) && k != "key1") {
            hh.push({
                text: k,
                value: k
            })
        }
    })
    return { dd, hh }
}

