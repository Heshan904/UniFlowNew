import React, { useEffect,useState } from "react";
import NaviBar from "../components/NaviBar";
import SideBar from "../components/SideBar";
import './canteen.css';
import { db } from "../firebase";
import { collection,  getDocs } from "firebase/firestore";



const Canteen = () => {

  const [data , setData] = useState([]);


  const fetchCanteenData = async () => {
    const docRef = collection(db, "canteenItems");
    const docSnap = await getDocs(docRef);
  //  console.log(docSnap);
    let items = [];
    docSnap.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    setData(items);
    console.log(items);
}

useEffect(() => {
  fetchCanteenData().then(data => {
    console.log("Canteen Data:", data);
  }).catch(error => {
    console.error("Error fetching canteen data:", error);
  });
  
}, []);

  return (
    <>
    <NaviBar/>
    <div className="canteenmain">
        <SideBar/>
        <div className="canteencontent">
          {data.map((item) => (
            <div key={item.id} className="canteen-card">
              
              {/* Category Badge */}
              <span className="canteen-badge">{item.category}</span>

              {/* Title */}
              <h3 className="canteen-title">{item.name}</h3>

              {/* Description */}
              <p className="canteen-desc">{item.desc}</p>

              {/* Price */}
              <div className="canteen-price">Rs. {item.price}</div>

              {/* Availability */}
              <div className={`canteen-status ${item.available ? "on" : "off"}`}>
                {item.available ? "Available" : "Not Available"}
              </div>

              {/* Stock */}
              <div className="canteen-stock">Stock: {item.stock}</div>

            </div>
          ))}
        </div>

    </div>
    </>
  );
};

export default Canteen;