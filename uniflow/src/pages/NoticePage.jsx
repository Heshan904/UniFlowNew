import React from "react";
import './noticepage.css';
import NaviBar from "../components/NaviBar";
import SideBar from "../components/SideBar";
import NoticeBoard from '../components/NoticeBoard';


const noticeImages = [
  
  'https://res.cloudinary.com/da2wbtci0/image/upload/v1755964000/WhatsApp_Image_2025-08-22_at_12.53.38_PM_j2h0ua.jpg',
  'https://res.cloudinary.com/da2wbtci0/image/upload/v1755964001/WhatsApp_Image_2025-08-21_at_12.26.17_PM_fjchvn.jpg',
  'https://res.cloudinary.com/da2wbtci0/image/upload/v1755964001/WhatsApp_Image_2025-08-22_at_7.52.54_AM_rgaftc.jpg',
];



const NoticePage = () => {
  return (
    <>
    <NaviBar/>
    <div className="noticemain">
        <SideBar/>
        <div className="noticecontent">
            <NoticeBoard images={noticeImages} interval={5000} />
        </div>
    </div>

    </>
  );
};

export default NoticePage;