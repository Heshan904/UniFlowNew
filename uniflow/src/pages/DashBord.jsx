import React from 'react';
import './dashbord.css';
import NaviBar from '../components/NaviBar';
import SideBar from '../components/SideBar';
import NoticeBoard from '../components/NoticeBoard';
import { useMedicalAvailability } from '../context/MedicalAvailabilityContext';

const noticeImages = [
  
  'https://res.cloudinary.com/da2wbtci0/image/upload/v1755964000/WhatsApp_Image_2025-08-22_at_12.53.38_PM_j2h0ua.jpg',
  'https://res.cloudinary.com/da2wbtci0/image/upload/v1755964001/WhatsApp_Image_2025-08-21_at_12.26.17_PM_fjchvn.jpg',
  'https://res.cloudinary.com/da2wbtci0/image/upload/v1755964001/WhatsApp_Image_2025-08-22_at_7.52.54_AM_rgaftc.jpg',
];

function DashBord() {
  const { isAvailable } = useMedicalAvailability();

  return (
    <>
      <NaviBar />
      <div className="dash">
        <SideBar />
        <div className="nimg">
          <NoticeBoard images={noticeImages} interval={5000} />
          <div className="linkbox linkbox--availability">
            <h3 className="linkbox__title">Medical Availability</h3>
            <div className="availability-indicator">
              <span
                className={`availability-dot ${
                  isAvailable ? 'availability-dot--on' : 'availability-dot--off'
                }`}
                role="presentation"
              />
              <span className="availability-status">
                {isAvailable ? 'ON' : 'OFF'}
              </span>
              <span className="sr-only">
                Medical availability is {isAvailable ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
          <div className="linkbox linkbox--results">
            <h3 className="linkbox__title">See results</h3>
            <h1 className="linkbox__highlight">SiS</h1>
          </div>
        </div>
      </div>
    </>
  );
}

export default DashBord;
