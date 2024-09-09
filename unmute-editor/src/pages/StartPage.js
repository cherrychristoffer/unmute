import {React} from "react";

import {Link, useLocation} from "wouter";
import {useSelector} from "react-redux";

export const StartPage = () => {
    const [_location, navigate] = useLocation();
    const unmutes = useSelector((state) => state.user.unmutes);

    if (unmutes.length > 0) {
        navigate("/orientation");
        return;
    }

    return (
        <div className="mx-auto flex flex-col items-center justify-center h-full -mt-4">
            <Link
                to="/offers"
                className="font-medium font-serif text-6xl text-white cursor-pointer relative inline-flex items-center justify-center w-64 h-64 overflow-hidden bg-rose-500 rounded-full transition duration-200 ease-out hover:bg-rose-700"
            >
                +
            </Link>

            <div className="font-serif text-muld-500 text-[17px] mt-16">
                Start Creating
            </div>
        </div>
    );
};
