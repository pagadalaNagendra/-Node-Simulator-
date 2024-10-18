// import React, { useState } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faBars, faHome, faCog, faThLarge, faNetworkWired, faDownload } from '@fortawesome/free-solid-svg-icons';
// import './Sidebar.css';

// const Sidebar = () => {
//   const [isOpen, setIsOpen] = useState(false);

//   const toggleSidebar = () => {
//     setIsOpen(!isOpen);
//   };

//   return (
//     <div className="sidebar-container">
//       <div className={`sidebar ${isOpen ? 'open' : ''}`}>
//         <div className="menu-icons">
//           <FontAwesomeIcon icon={faHome} />
//           <FontAwesomeIcon icon={faCog} />
//           <FontAwesomeIcon icon={faThLarge} />
//           <FontAwesomeIcon icon={faNetworkWired} />
//           <FontAwesomeIcon icon={faDownload} />
//         </div>
//       </div>
//       <button className="hamburger" onClick={toggleSidebar}>
//         <FontAwesomeIcon icon={faBars} />
//       </button>
//     </div>
//   );
// };

// export default Sidebar;
