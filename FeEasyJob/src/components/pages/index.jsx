import React from "react";
import Intro from "../Intro/Intro";
import Services from "../Services/Services";
import Experience from '../Experience/Experience';
import Works from '../Works/Works';
import Portfolio from '../Portfolio/Portfolio';
import Testimonial from '../Testimonials/Testimonial';
import Footer from '../Footer/Footer';
import "../../App.css";
import Header from "../layout/header";
function Index() {
  return (
    <div className="App">
      <Header />
      <Intro />
      <Services />
      <Experience />
      <Works />
      <Portfolio />
      <Testimonial />
      <Footer />
    </div>
  );
}

export default Index;
