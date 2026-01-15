import Home from './pages/Home';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';


export const PAGES = {
    "Home": Home,
    "Register": Register,
    "ForgotPassword": ForgotPassword,
    "PatientDashboard": PatientDashboard,
    "DoctorDashboard": DoctorDashboard,
    "AdminDashboard": AdminDashboard,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};