/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Home from './pages/Home';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Gallery from './pages/Gallery';
import Raffles from './pages/Raffles';
import MyTickets from './pages/MyTickets';
import AdminDashboard from './pages/AdminDashboard';
import AdminNews from './pages/AdminNews';
import AdminEvents from './pages/AdminEvents';
import AdminPhotos from './pages/AdminPhotos';
import AdminRaffles from './pages/AdminRaffles';
import AdminTickets from './pages/AdminTickets';
import AdminReports from './pages/AdminReports';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "News": News,
    "NewsDetail": NewsDetail,
    "Events": Events,
    "EventDetail": EventDetail,
    "Gallery": Gallery,
    "Raffles": Raffles,
    "MyTickets": MyTickets,
    "AdminDashboard": AdminDashboard,
    "AdminNews": AdminNews,
    "AdminEvents": AdminEvents,
    "AdminPhotos": AdminPhotos,
    "AdminRaffles": AdminRaffles,
    "AdminTickets": AdminTickets,
    "AdminReports": AdminReports,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};