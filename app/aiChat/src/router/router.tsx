import { createBrowserRouter } from "react-router";
import Index from "../pages/index";
import Login from "../pages/login/login";

const mainRouters = [{
    path: '/',
    element: <Index />
}, {
    path: '/login', element: <Login />
}];

const router = createBrowserRouter(mainRouters);

export default router;