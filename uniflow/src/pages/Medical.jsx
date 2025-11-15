import React from "react";
import NaviBar from "../components/NaviBar";
import SideBar from "../components/SideBar";
import './medical.css';

const Medical = () => {
  return (
    <>
    <NaviBar/>
    <div className="medicalnmain">
        <SideBar/>
        <div className="medicalcontent">

        </div>
    </div>
    </>
  );
};

export default Medical;