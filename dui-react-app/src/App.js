import logo from './logo.svg';
import './App.css';

import Link from '@mui/material/Link';
import { useEffect, useState } from 'react'

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  AppBar, Toolbar, Typography, IconButton, ListItem, ListItemText, Box, ListItemButton, ListItemIcon,
  Drawer,
  List,
  Divider, Breadcrumbs
} from '@mui/material';

import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import HomeIcon from '@mui/icons-material/Home';

import { Outlet, useNavigate } from 'react-router-dom';

import MenuIcon from '@mui/icons-material/Menu';


// Redux
import { Provider } from 'react-redux'
import { useSelector, useDispatch } from 'react-redux'
import store from './redux-store'

import {
  createBrowserRouter,
  RouterProvider,
  Route,
} from "react-router-dom";


import DUI from "./dui/DUI"

import AWSDynamo from "./lib/aws-dynamo"


let awsDynamo = new AWSDynamo()

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const themeLight = createTheme({
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <App init="1" />,
    children: [
      {
        path: "/dui",
        element: <DUI awsDynamo={awsDynamo} />,
      }
    ]
  }

]);

const COMPANY = "Dynamo UI"


function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center" className='noprint'>
      {'Copyright © '}
      <Link color="inherit" href="https://bharatsevashramsangha.in/">
        {COMPANY}
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const NAVIGATIONS = [
  {
    path: '/tabel1',
    label: 'Table1'
  }
]

const DrawerList = (props) => {

  const navigate = useNavigate()

  return (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={() => props.toggleDrawer(false)}
      onKeyDown={() => props.toggleDrawer(false)}
    >
      <List>
        {
          NAVIGATIONS.map(
            (n, i) =>
              <ListItem key={n.path} disablePadding>
                <ListItemButton onClick={() => {
                  navigate(n.path)
                }}>
                  <ListItemIcon>
                    <InboxIcon />
                  </ListItemIcon>
                  <ListItemText primary={n.label} />
                </ListItemButton>
              </ListItem>
          )
        }
      </List>
    </Box>
  )
}

let loadMaster = (dispatch) => {

  console.log('Fetching Master...')

  awsDynamo.init(
    {
      accessKeyId: "fake",
      secretAccessKey: "fake",
      sessionToken: "fake",
      endpoint: "http://localhost:8000",
      region: 'ap-south-1'
    }
  )

  awsDynamo.listTables().then(
    (dr) => {
      console.log('Tables', dr)
      dispatch({ type: 'tables', payload: dr['TableNames'] })
    }
  ).catch((e) => {
    console.error('error fetching tables', e)
  })
}

function App(props) {

  const dispatch = useDispatch()

  let [places, setPlaces] = useState({})

  let [drawer, setDrawer] = useState(false)

  let currentCheckins = useSelector(state => state.currentCheckins)

  useEffect(() => {

    console.log('Use effect fired')
    loadMaster(dispatch)

  }, [props.init]);

  const toggleDrawer = () => {
    setDrawer(false)
  }

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Drawer
          anchor="left"
          open={drawer}
          onClose={() => toggleDrawer()}
        >
          <DrawerList toggleDrawer={toggleDrawer} />
        </Drawer>

        <AppBar
          position="absolute"
          color="default"
          elevation={0}
          sx={{
            position: 'relative',
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
          }}
          className="noprint">
          <Toolbar>

            <IconButton edge="end" aria-label="delete" className="noprint" style={{ marginRight: 5 }} onClick={() => {
              setDrawer(false)
            }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" color="inherit" noWrap className="noprint">
              {COMPANY}
            </Typography>



            <IconButton edge="end" aria-label="delete" className="noprint" style={{ marginRight: 5 }} onClick={() => {

            }}>
              <HomeIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Outlet />

        <Copyright />
      </ThemeProvider>
    </div>
  );
}

function AppWithReduxAndRouter() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  )
}

export default AppWithReduxAndRouter;
