import './App.css'
import DisplayMap from './components/DisplayMap'
import Display from './components/Display'
import BusMap from './components/BusMap'
import BusMoving from './components/BusMoving';
import Test1 from './components/Test1';


import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
function App() {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Router>
      <AppBar position="fixed" sx={{ zIndex: 1300 }}>
        <Toolbar>
          {/* Hamburger menu for mobile */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenuOpen}
            sx={{ display: { xs: "flex", md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Mobile menu items */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose} component={Link} to="/GTFS">
              GTFS
            </MenuItem>
            <MenuItem onClick={handleMenuClose} component={Link} to="/SIRI">
              SIRI
            </MenuItem>
            <MenuItem onClick={handleMenuClose} component={Link} to="/">
              GTFS+SIRI
            </MenuItem>
          </Menu>

          {/* Logo or title */}
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: { xs: "center", md: "left" } }}>
            VGI Bus Tracking Map
          </Typography>

          {/* Navigation buttons for desktop */}
          <div style={{ display: "flex", gap: "10px", marginLeft: "auto" }}>
            <Button color="inherit" component={Link} to="/GTFS" sx={{ display: { xs: "none", md: "inline-flex" } }}>
              GTFS
            </Button>
            <Button color="inherit" component={Link} to="/SIRI" sx={{ display: { xs: "none", md: "inline-flex" } }}>
              SIRI
            </Button>
            <Button color="inherit" component={Link} to="/" sx={{ display: { xs: "none", md: "inline-flex" } }}>
              GTFS+SIRI
            </Button>
          </div>
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/GTFS" element={<DisplayMap />} />
        <Route path="/SIRI" element={<BusMap />} />
        <Route path="/" element={<Test1 />} />
      </Routes>
    </Router>
  );
}

export default App;

