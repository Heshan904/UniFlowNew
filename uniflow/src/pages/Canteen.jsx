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
            <div key={item.id} className="canteen-item-card">
              <h3>{item.name}</h3>  
              <p>Category: {item.category}</p>
              <p>Description: {item.desc}</p>
              <p>Price: ${item.price}</p>
              <p>Available: {item.available ? "Yes" : "No"}</p>
              <p>Stock: {item.stock}</p>
            </div>
          ))}

        </div>
    </div>
    </>
  );
};

export default Canteen;