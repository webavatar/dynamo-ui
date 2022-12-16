
/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Object} Accomodation
 * @property {Array} rooms -rooms
 * @property {Array} beds - beds
 * @property {Object} data - data
 */

const postData = (url = '', data = {}) => {
    // Default options are marked with *
    const response = fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response; // parses JSON response into native JavaScript objects
}

const DR_HEADERS = [{ "title": "Checkin ID", "key": "ciid" },
{ "title": "Security Deposit", "key": "securityDeposit", "total": 0 },
{ "title": "Utensil Deposit", "key": "utensilDeposit", "total": 0 },
{ "title": "Checkout ID", "key": "coid" },
{ "title": "Security Refund", "key": "securityRefund", "total": 0 },
{ "title": "Utensil Refund", "key": "utensilRefund", "total": 0 }]

const DR_TOTAL = {
    "securityDeposit": 0,
    "utensilDeposit": 0,
    "utensilRefund": 0,
    "securityRefund": 0
}

let Utils = () => {
    return {

        /**
         * 
         * @param {Object} OccupancyServiceResponse  
         * @returns {Accomodation}  
         */
        processData: (res) => {

            let protectedFields = ['id', 'created', 'modified_on']

            let selectedRooms = []
            let selectedBeds = []
            let occupancy = {}
            let data = { buildings: [], buildingsData: [] }
            let rooms = {}
            let beds = {}

            let pushBuilding = (building) => {
                if (!data.buildings.includes(building)) {
                    data.buildings.push(building)
                    data.buildingsData[building] = { floors: [], floorsData: {} }
                }
            }

            let pushFloor = (building, floor) => {
                if (!data.buildingsData[building].floors.includes(floor)) {
                    data.buildingsData[building].floors.push(floor);
                    // todo 
                    data.buildingsData[building].floorsData[floor] = {
                        rooms: [], roomsData: {}, dormitories: [], dormitoriesData: {}
                    }
                }
            }

            let pushRoom = (room, roomData, roomId, isDormitory, building, floor) => {
                if (isDormitory && !data.buildingsData[building].floorsData[floor].dormitories.includes(room)) {
                    data.buildingsData[building].floorsData[floor].dormitories.push(room);
                    data.buildingsData[building].floorsData[floor].dormitoriesData[room] = {
                        id: roomId, beds: [], bedsData: {}
                    }
                }
                if (!isDormitory && !data.buildingsData[building].floorsData[floor].rooms.includes(room)) {
                    data.buildingsData[building].floorsData[floor].rooms.push(room);
                    data.buildingsData[building].floorsData[floor].roomsData[room] = roomData
                    roomData['id'] = roomId
                }
            }

            let pushBed = (bed, bedData, id, room, building, floor) => {
                if (!data.buildingsData[building].floorsData[floor].dormitoriesData[room].beds.includes(bed)) {
                    data.buildingsData[building].floorsData[floor].dormitoriesData[room].beds.push(bed)
                    // todo 
                    data.buildingsData[building].floorsData[floor].dormitoriesData[room].bedsData[bed] = bedData
                    bedData['id'] = id

                }
            }

            Object.entries(res).forEach(([k, v]) => {
                if (protectedFields.includes(k))
                    return
                //console.log('Room', k, 'Details', v)
                pushBuilding(v['building'])
                pushFloor(v['building'], v['floor'])


                if (v['bedtype']) {
                    // dorm
                    pushRoom(v['room'], v, k, true, v['building'], v['floor'])
                    pushBed('' + v['bedNumber'], v, k, v['room'], v['building'], v['floor'])
                    beds['' + v['bedNumber']] = v
                } else {
                    pushRoom(v['roomNumber'], v, k, false, v['building'], v['floor'])
                    rooms[v['roomNumber']] = v
                }
            })

            console.debug('Data', data)

            return {
                selectedRooms: selectedRooms,
                selectedBeds: selectedBeds,
                occupancy: occupancy,
                data: data,
                rooms: rooms,
                beds: beds
            }
        },

        findMatchingData: (stateType, personType, namePart, loadHandler) => {
            postData('http://localhost:9020/bss/test',
                {
                    operation: 'find' + stateType + personType,
                    params: { name: namePart }
                })
                .then(res => {
                    console.log('Response is ', res)
                    try {
                        return res.json()
                    } catch (error) {
                        throw error
                    }

                })
                .then(res => {
                    console.log('Data', res)
                    loadHandler(res)
                })
                .catch(err => {
                    console.log(err)
                })
                .finally(() => {
                    console.log('Completed')
                })
        },

        loadCheckins: (loadHandler) => {

            postData('http://localhost:9020/bss/test', {
                operation: 'findCurrentPatients'
            })
                .then(res => {
                    console.log('Response is ', res)
                    try {
                        return res.json()
                    } catch (error) {
                        throw error
                    }

                })
                .then(res => {
                    console.log('Data', res)
                    loadHandler(res)
                })
                .catch(err => {
                    console.log(err)
                })
                .finally(() => { })
        },

        loadMaster: (loadHandler) => {
            postData('http://localhost:9020/bss/test', {
                operation: 'findMaster'
            }).then(res => {
                console.log('Response is ', res)
                try {
                    return res.json()
                } catch (error) {
                    throw error
                }

            }).then(res => {
                console.log('Data', res)
                let master = res

                let countries = []
                let states = {}
                let places = {}

                Object.keys(master.places).forEach(c => {
                    countries.push(c)
                    states[c] = []
                    places[c] = []
                    // states
                    Object.keys(master.places[c]).forEach(s => {
                        states[c].push(s)
                        // places
                        master.places[c][s].forEach(p => {
                            places[c].push(p)
                        })
                    })
                })

                master.countries = countries
                master.states = states
                master.allPlaces = places

                loadHandler(master)

                //dispatch({ type: 'master/set', payload: master })
                //dispatch({ type: 'master/setMaterialSet', payload: master.material_set })

            }).catch(err => {
                console.log(err)
            }).finally(() => {

            })

        },

        loadOccupancy: (loadHandler) => {
            postData('http://localhost:9020/bss/test',
                {
                    operation: 'occupancy', //
                    params: {}
                })
                .then(res => {
                    console.log('Response is ', res)
                    try {
                        return res.json()
                    } catch (error) {
                        throw error
                    }

                })
                .then(res => {
                    //console.log('Data', res)
                    loadHandler(res)
                })
                .catch(err => {
                    console.log(err)
                })
        },

        findCheckinDetails: (patientId, loadHandler) => {
            postData('http://localhost:9020/bss/test',
                {
                    operation: 'findExistingCheckinDetails', //
                    params: { id: patientId }
                })
                .then(res => {
                    console.log('Response is ', res)
                    try {
                        return res.json()
                    } catch (error) {
                        throw error
                    }
                })
                .then(res => {
                    loadHandler(res)
                })
                .catch(err => {
                    console.log(err)
                })
        },


        /**
         * Find current by name
         * @param {string} startChars 
         */
        findCurrentByName(startChars, type, loadHandler) {
            postData('http://localhost:9020/bss/test', {
                operation: 'find' + type,
                params: { name: startChars }
            })
                .then(res => {
                    console.log('Response is ', res)
                    try {
                        return res.json()
                    } catch (error) {
                        throw error
                    }

                })
                .then(res => {
                    loadHandler(res, type)
                })
                .catch(err => {
                    console.log(err)
                })
                .finally(() => { })
        },

        loadDailyReportingPast(last_reported_on, loadHandler) {

            if (!last_reported_on) {
                console.log('No past data exists')
                return
            }

            postData('http://localhost:9020/bss/test', {
                operation: 'findForKey',
                params: { id: 'daily_reporting', created: last_reported_on }
            })
                .then(res => {
                    console.log('Response is ', res)
                    try {
                        return res.json()
                    } catch (error) {
                        throw error
                    }

                })
                .then(res => {
                    loadHandler(res)
                })
                .catch(err => {
                    console.log(err)
                })
                .finally(() => (this.isLoading = false))
        },

        loadDailyReporting: (loadHandler) => {

            postData('http://localhost:9020/bss/test', {
                operation: 'findDailyReporting',
                params: {}
            })
                .then(res => {
                    console.log('Response is ', res)
                    try {
                        return res.json()
                    } catch (error) {
                        throw error
                    }

                })
                .then(res => {
                    loadHandler(res)
                })
                .catch(err => {
                    console.log(err)
                })
                .finally(() => { })
        },

        processReportData: (res) => {
            console.log('Daily Report', res)
            let dailyReport = res

            let items = []
            let total = JSON.parse(JSON.stringify(DR_TOTAL))
            let headers = JSON.parse(JSON.stringify(DR_HEADERS))

            dailyReport.checkedin.forEach(ci => {
                items.push({
                    "ciid": ci.id,
                    "securityDeposit": ci.security_deposit,
                    "utensilDeposit": ci.utensil_deposit
                })
                headers[1]['total'] = headers[1]['total'] + parseInt(ci.security_deposit)
                headers[2]['total'] = headers[2]['total'] + parseInt(ci.utensil_deposit)
            })

            dailyReport.checkedout.forEach((co, i) => {
                let it = items[i]
                let coit = {
                    "coid": co.id,
                    "securityRefund": co.security_refund,
                    "utensilRefund": co.utensil_refund
                }
                headers[4]['total'] = headers[4]['total'] + parseInt(co.security_refund)
                headers[5]['total'] = headers[5]['total'] + parseInt(co.utensil_refund)
                if (it) {
                    items[i] = {
                        ...items[i],
                        ...coit
                    }
                } else {
                    items.push(coit)
                }
            })

            total.securityDeposit = headers[1]['total']
            total.utensilDeposit = headers[2]['total']

            total.securityRefund = headers[4]['total']
            total.utensilRefund = headers[5]['total']

            return {
                dailyReport: dailyReport,
                total: total,
                items: items,
                headers: headers
            }

        }

    }
}

export default Utils