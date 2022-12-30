import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import {
    AppBar, Toolbar, Typography, IconButton, ListItem, ListItemText, Box, ListItemButton, ListItemIcon,
    Drawer,
    List,
    Divider, Container, Paper, Tab, Tabs, Chip, Stack,
    AccordionSummary, Accordion, AccordionDetails
} from '@mui/material';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

import PageviewIcon from '@mui/icons-material/Pageview';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { DataGrid, GridRowsProp, GridColDef } from '@mui/x-data-grid';


const Tables = (props) => {
    return (
        <List style={{ padding: 20 }}>
            {
                props.tables.map(
                    (table, i) =>
                        <ListItem key={i} style={
                            {
                                margin: 10,
                                borderRadius: 5,
                                backgroundColor: i % 2 == 0 ? 'rgb(100, 149, 237)' : 'rgb(204, 204, 255)'
                            }}
                            secondaryAction={
                                <>
                                    <IconButton edge="end" style={{ marginRight: 5 }}
                                        onClick={() => {
                                            props.selected(table)
                                        }}
                                    >
                                        <PageviewIcon />
                                    </IconButton>
                                </>
                            }

                        >
                            <ListItemText primary={table} />

                        </ListItem>
                )
            }
        </List>
    )
}

const TableDetails = (props) => {

    const [tab, setTab] = useState('1')

    const [columns, setColumns] = useState(props.items.keys)

    const [gindex, setGIndex] = useState({})

    const fetchIndex = (index) => {
        console.log('Index fetch requested for', props.table, index)
        ///
        props.awsDynamo.scanIndex(props.table, index)
            .then((data) => {

                let keyAttrs = []

                props.tableDetails['tableDetails']['Table']['GlobalSecondaryIndexes']
                    .filter(i => {
                        return i.IndexName == index
                    })
                    .map(i => {
                        return i['KeySchema']
                    })
                    .flat()
                    .forEach((i) => {
                        keyAttrs.push(i.AttributeName)
                    })

                console.log('Key Attrs for ', index, 'is', keyAttrs)

                let { dd, hh } = props.awsDynamo.dynamoItemsToTable(data, keyAttrs, 'key1')

                console.log('Table Items obtained', dd, hh)

                let columns = []
                hh.forEach((h) => {
                    columns.push({ 'field': h.value, 'headerName': h.text, width: 200 })
                })

                setGIndex(pI => {
                    return {
                        ...pI,
                        [index]: { items: dd, columns: columns }
                    }
                })

            }).catch((e) => {
                console.error('Error fetching data for table', e)
                throw e
            })
    }

    const indexViewChanged = (ind, expanded) => {
        console.log('Index', ind, expanded)
        if (expanded) {
            fetchIndex(ind)
        }
    }


    return (
        <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tab} onChange={(x, n) => setTab(n)} aria-label="basic tabs example">
                    <Tab label="Manage" value="1" />
                    <Tab label="Attributes" value="2" />
                    <Tab label="Global Indexes" value="3" />
                    <Tab label="Items" value="4" />
                </Tabs>
            </Box >

            <Box style={{ display: tab == '2' ? 'block' : 'none' }}>
                {
                    props.tableDetails.attributes.map(
                        (ind, ri) =>
                            <Accordion key={ri}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1a-content"

                                >
                                    <Typography>{ind}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                                        malesuada lacus ex, sit amet blandit leo lobortis eget.
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                    )
                }
            </Box>
            <Box style={{ display: tab == '3' ? 'block' : 'none' }} >
                {
                    props.tableDetails.indexes.map(
                        (ind, ri) =>
                            <Accordion key={ri} onChange={(e, expanded) => {
                                indexViewChanged(ind, expanded)
                            }} >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1a-content"

                                >
                                    <Typography>{ind}</Typography>
                                </AccordionSummary>
                                <AccordionDetails style={{ height: 500 }}>
                                    <DataGrid rows={gindex[ind] ? gindex[ind].items : []}
                                        getRowId={(row) => row.key1}
                                        columns={gindex[ind] ? gindex[ind].columns : []} />

                                </AccordionDetails>
                            </Accordion>
                    )
                }


            </Box>
            <Box style={{ display: tab == '4' ? 'block' : 'none', minHeight: 300, height: 500 }} >
                <DataGrid rows={props.items ? props.items.items : []}
                    getRowId={(row) => row.key1}
                    columns={props.items ? props.items.columns : []} />
            </Box>

        </>
    )
}



const DUI = (props) => {

    const tables = useSelector(state => state.tables)

    const [table, setTable] = useState('')

    const [tableDetails, setTableDetails] = useState({})

    const [tableItems, setTableItems] = useState({})

    const tableDetailsObtained = (table, tableDetails) => {
        props.awsDynamo.scan(table)
            .then((data) => {

                console.log('Table items obtained', data)

                console.log('Table Details', tableDetails)

                let x = {
                    [table]: {
                        items: [],
                        keys: []
                    }
                }

                let keyAttrs = []

                tableDetails[table]['tableDetails']['Table']['KeySchema'].forEach((i) => {
                    keyAttrs.push(i.AttributeName)
                })

                let { dd, hh } = props.awsDynamo.dynamoItemsToTable(data, keyAttrs, 'key1')

                console.debug('Table Items obtained', dd, hh)

                x[table].items = dd
                x[table].headers = hh

                // field: 'col1', headerName: 'Column 1', width: 150 }
                let columns = []
                hh.forEach((h) => {
                    columns.push({ 'field': h.value, 'headerName': h.text, width: 200 })
                })

                x[table]['columns'] = columns

                setTableItems(x)

                console.log('Items', x)

            }).catch((e) => {
                console.error('Error fetching data for table', e)
                throw e
            })

    }


    const tableSelected = async (table) => {
        console.log('Selected table', table)
        setTable(table)
        setTableDetails({ [table]: { 'attributes': [], 'indexes': [] } })
        setTableItems({ [table]: { items: [], columns: [] } })

        ///
        await props.awsDynamo.fetchTableDetails(table)

            .then((data) => {

                console.log('Table Data', data)


                setTableDetails(pD => {
                    console.log('Fired...')
                    let x = {
                        [table]: {
                            'tableDetails': data,
                            'attributes': [],
                            'indexes': []
                        }
                    }

                    data['Table']['GlobalSecondaryIndexes'].forEach((i) => {
                        x[table]['indexes'].push(i.IndexName)
                    })

                    data['Table']['AttributeDefinitions'].forEach((i) => {
                        x[table]['attributes'].push(i.AttributeName)
                    })

                    tableDetailsObtained(table, x)
                    return x
                })


                console.log('Table Data obtained', data)


            }).catch((e) => {
                console.error('Error fetching data for table', e)
                throw e
            })
        ///

    }

    return (

        <>

            <Container component="main" maxWidth="lg" sx={{ mb: 4 }}>
                <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                    <Typography component="h1" variant="h4" align="center">
                        Tables
                    </Typography>

                    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        <Tables tables={tables} selected={tableSelected} />
                        {
                            table != '' ?
                                <TableDetails table={table} awsDynamo={props.awsDynamo} tableDetails={tableDetails[table]} items={tableItems[table]} />
                                :
                                <span></span>
                        }
                    </Box>


                </Paper>
            </Container>
        </>
    )
}

export default DUI