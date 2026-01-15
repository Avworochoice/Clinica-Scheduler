import Home from './pages/Home';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import PatientDashboard from './pages/PatientDashboard';


export const PAGES = {
    "Home": Home,
    "Register": Register,
    "ForgotPassword": ForgotPassword,
    "PatientDashboard": PatientDashboard,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};