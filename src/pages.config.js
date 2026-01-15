import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Home from './pages/Home';
import PatientDashboard from './pages/PatientDashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminDashboard": AdminDashboard,
    "DoctorDashboard": DoctorDashboard,
    "Home": Home,
    "PatientDashboard": PatientDashboard,
    "Profile": Profile,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};