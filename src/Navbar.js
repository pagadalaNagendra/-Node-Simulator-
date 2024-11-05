import React, { useState } from "react";
import { AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, CssBaseline, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import BatchPredictionIcon from "@mui/icons-material/BatchPrediction";
import AutoAwesomeMotionIcon from "@mui/icons-material/AutoAwesomeMotion";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import Terminal from "./components/Terminal"; // Import the Terminal component
import Status from "./components/statustable";
const drawerWidth = 180;
const primaryColor = "#123462"; // Define your primary color
const rightSidebarWidth = 428; // Width for the right sidebar

export default function SidebarNavbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate(); // Initialize navigation

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Navigation functions
  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Navbar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: primaryColor, // Change navbar background color
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Left Side: Hamburger + Logo */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton color="inherit" edge="start" onClick={toggleSidebar} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
            <img src="https://res.cloudinary.com/dxoq1rrh4/image/upload/v1729675203/IMG_4638_1_hx3bzm.png" alt="Logo" style={{ height: 60, marginRight: 10 }} />
          </Box>

          {/* Center Title */}
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
          Node Simulator
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Left Sidebar Drawer */}
      <Drawer
        variant="permanent"
        open={isSidebarOpen}
        sx={{
          width: isSidebarOpen ? drawerWidth : 60,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: isSidebarOpen ? drawerWidth : 60,
            boxSizing: "border-box",
            backgroundColor: "#FFFFFF",
            transition: "width 0.3s",
          },
        }}
      >
        <Toolbar />
        <List>
          <ListItem button onClick={() => handleNavigate("/Node-Simultor")}>
            <ListItemIcon>
              <HomeIcon sx={{ color: "#707070" }} />
            </ListItemIcon>
            {isSidebarOpen && <ListItemText primary="Home" sx={{ color: "#707070" }} />}
          </ListItem>

          <ListItem button onClick={() => handleNavigate("/Node-Simultor/Addvertical")}>
            <ListItemIcon>
              <AutoAwesomeMotionIcon sx={{ color: "#707070" }} />
            </ListItemIcon>
            {isSidebarOpen && <ListItemText primary="Add vertical" sx={{ color: "#707070" }} />}
          </ListItem>

          <ListItem button onClick={() => handleNavigate("/Node-Simultor/node")}>
            <ListItemIcon>
              <InfoIcon sx={{ color: "#707070" }} />
            </ListItemIcon>
            {isSidebarOpen && <ListItemText primary="Platform" sx={{ color: "#707070" }} />}
          </ListItem>

          <ListItem button onClick={() => handleNavigate("/Node-Simultor/Predefinedconfigurations")}>
            <ListItemIcon>
              <BatchPredictionIcon sx={{ color: "#707070" }} />
            </ListItemIcon>
            {isSidebarOpen && <ListItemText primary="Predefined" sx={{ color: "#707070" }} />}
          </ListItem>

          <ListItem button onClick={() => handleNavigate("/Node-Simultor/Historystatus")}>
            <ListItemIcon>
              <HistoryEduIcon sx={{ color: "#707070" }} />
            </ListItemIcon>
            {isSidebarOpen && <ListItemText primary="Historystatus" sx={{ color: "#707070" }} />}
          </ListItem>
        </List>
      </Drawer>

      {/* Right Sidebar Drawer (Always Open) */}
      {/* <Drawer
        variant="permanent"
        anchor="right"
        sx={{
          width: rightSidebarWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: rightSidebarWidth,
            boxSizing: "border-box",
            backgroundColor: "#F5F5F5",
          },
        }}
      >
        <Toolbar />
        <List>
          <ListItem>
            <Status />
          </ListItem>

          <ListItem>
            <Terminal />
          </ListItem>
        </List>
      </Drawer> */}
    </Box>
  );
}
