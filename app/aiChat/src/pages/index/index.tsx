import router from "@/router/router";
import { Link } from "react-router";

export default function Index() {

    return <>
        首页
        <Link to="/login">关于我们</Link>
    </>
}