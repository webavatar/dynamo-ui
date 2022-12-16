
import AWS from "aws-sdk"

export default function AWSDynamo() {
    return {
        dynamodb: undefined,

        init(config) {
            this.dynamodb = new AWS.DynamoDB(config);
        },

        deserializer(item) {
            return AWS.DynamoDB.Converter.unmarshall(item)
        },

        deserializerItems(items) {
            let its = []
            items["Items"].forEach(el => {
                its.push(this.deserializer(el))
            });
            return its
        },

        scan(table) {
            var params = {
                TableName: table
            };
            return this.dynamodb.scan(params).promise()
        },

        scanIndex(table, index) {
            var params = {
                TableName: table,
                IndexName: index
            };
            return this.dynamodb.scan(params).promise()
        },

        listTables() {
            var params = {
            };
            return this.dynamodb.listTables(params).promise()
        },
 
        fetchTableDetails(table) {
            var params = {
                TableName: table
            };
            return this.dynamodb.describeTable(params).promise()
        },

        saveTableItem(table, item) {
            var params = {
                Item: AWS.DynamoDB.Converter.marshall(item),
                TableName: table
            };
            return this.dynamodb.putItem(params).promise()
        },

        deleteTableItem(table, key) {
            var params = {
                Key: AWS.DynamoDB.Converter.marshall(key),
                TableName: table
            };
            return this.dynamodb.deleteItem(params).promise()
        },

        fetchDynamoTables() {

            this.listTables('bssnew')
                .then((data) => {
                    console.log('Info is ', (data))
                }).catch((e) => {
                    console.log('Error fetching table details', e)
                })

        },

        /**
             * 
             * @param {*} data 
             * @param {Set} mainAttrs 
             * @returns 
             */


        dynamoItemsToTable(data, keyAttrs, keyName) {

            console.debug('Mapping Items to Table', keyAttrs)

            let d = this.deserializerItems(data)

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
    }
}