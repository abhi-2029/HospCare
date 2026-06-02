import React, { useEffect } from "react";
import style from "../CSS/Home.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Carousel from "react-bootstrap/Carousel";
import { AiOutlineDingding } from "react-icons/ai";
import { LuHeartCrack } from "react-icons/lu";
import { FaPlus } from "react-icons/fa";

import {cards,doctors }from "../obj";

import img1 from "../assets/doctar.jpeg";
import Banner1 from "../assets/Banner1.png";
import Banner2 from "../assets/Banner2.png";
import Banner3 from "../assets/Banner3.png";

function Home() {
  
  
  return (
    <div className={`${style.coverContainer} d-flex w-100 h-100 p-3 mx-auto flex-column`}>
      {/* 🔄 Carousel / Slidable Banner */}
      <Carousel className={style.carousel} controls={false} indicators={false} interval={3000} pause={false}>
        <Carousel.Item>
          <img className="d-block w-80" src={Banner1} alt="First slide" />
          <Carousel.Caption>
            <h3>Seamless Healthcare</h3>
            <p>Connect with top doctors and get the best treatment online.</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img className="d-block w-80" src={Banner2} alt="Second slide" />
          <Carousel.Caption>
            <h3>Trusted Medical Experts</h3>
            <p>Our doctors are experienced and here to help you.</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img className="d-block w-80" src={Banner3} alt="Third slide" />
          <Carousel.Caption>
            <h3>Book Appointments Easily</h3>
            <p>Schedule and manage your medical appointments online.</p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>
      <div className={style.main_container}>
    
    <div className={style.container2}>
      <div className={style.icon2}>
      <LuHeartCrack />
      </div>
      <div className={style.txt2}>
        Committed to You
      </div>
      <p className={style.ptxt2}> 
      Ultra Cure Hospital is the region's most trusted provider of women's healthcare. We have a highly trained team of medical experts, advanced facilities and unwavering commitment to the welfare of our patients.
      </p>
      <div >
        <button className={style.btm2}>Get Started</button>
        

      </div>

    </div>
    
    <div className={style.container3}>
      <div className={style.heading}>
        OUR SERVICES
      </div>
      <div className={style.intro}>
        Hosp Care hospital provides top-notch care in health specialisties.
      </div>
      <div className={style.cards}>
      {cards.map((card, index) => (
        <div key={index} className={style.card}>
          <img src={card.icon} alt={card.service} className={style.card_img} />
          <h3 className={style.card_text}>{card.service}</h3>
          <FaPlus></FaPlus>
        </div>
      ))}
      </div>
    </div>
    <div className={style.container4}>
      <div className={style.intro2}>
        Meet our Doctors
      </div>
      <div className={style.doctorContainer}>
      {doctors.map((doctor, index) => (
        

        
        <div key={index} className={style.doctorCard}>
          <img src={doctor.image} alt={doctor.name} className={style.doctorImage} />
          <div className={style.infocard}>
          <h2 className={style.doctorName}>{doctor.name}</h2>
          <p className={style.doctorSpeciality}>{doctor.speciality}</p>
          <p className={style.doctorAddress}>{doctor.address}</p>
          <p className={style.doctorIntro}>{doctor.intro}</p>
          </div>
        </div>
      ))}
    </div>
    </div>
  </div>      
    </div>
  );
}

export default Home;
