import React from "react";
import NaviBar from "../components/NaviBar";
import SideBar from "../components/SideBar";
import './canteen.css';

const Canteen = () => {
  return (
    <>
    <NaviBar/>
    <div className="canteenmain">
        <SideBar/>
        <div className="canteencontent">

        </div>
    </div>
    </>
  );
};

export default Canteen;