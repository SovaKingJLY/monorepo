import { createBrowserRouter } from "react-router";
// import Index from "../pages/index";
import Login from "../pages/login/login";
import ChatPage from "../pages/chat/ChatPage";

const mainRouters = [{
    path: '/',
    element: <Login />
}, {
    path: '/chat',
    element: <ChatPage />
}, {
    path: '/chat/:id',
    element: <ChatPage />
}];

const router = createBrowserRouter(mainRouters);

export default router;