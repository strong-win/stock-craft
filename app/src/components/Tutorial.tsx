import React, { useState } from "react";
import {
  Carousel,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
  CarouselCaption,
} from "reactstrap";

import tutorial1 from "../assets/tutorial1.png";
import tutorial2 from "../assets/tutorial2.png";
import tutorial3 from "../assets/tutorial3.png";
import tutorial4 from "../assets/tutorial4.png";

import "../styles/WaitingRoom.css";
const items = [
  {
    src: tutorial1,
    altText: "",
    caption: "",
  },
  {
    src: tutorial2,
    altText: "",
    caption: "",
  },
  {
    src: tutorial3,
    altText: "",
    caption: "",
  },
  {
    src: tutorial4,
    altText: "",
    caption: "",
  },
];

const Tutorial = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const next = () => {
    if (animating) return;
    const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIndex);
  };

  const previous = () => {
    if (animating) return;
    const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
    setActiveIndex(nextIndex);
  };

  const goToIndex = (newIndex) => {
    if (animating) return;
    setActiveIndex(newIndex);
  };

  const slides = items.map((item) => {
    return (
      <CarouselItem
        className="custom-tag h-100"
        tag="div"
        key={item.src}
        onExiting={() => setAnimating(true)}
        onExited={() => setAnimating(false)}
      >
        <img src={item.src} alt={item.altText} style={{ width: "100%" }} />
        <CarouselCaption
          className="text"
          captionText={item.caption}
          captionHeader={item.caption}
        />
      </CarouselItem>
    );
  });

  return (
    <>
      <Carousel
        className="carousel"
        activeIndex={activeIndex}
        next={next}
        previous={previous}
      >
        <CarouselIndicators
          items={items}
          activeIndex={activeIndex}
          onClickHandler={goToIndex}
        />
        {slides}
        <CarouselControl
          className="carouselControl"
          direction="prev"
          directionText=""
          onClickHandler={previous}
        />
        <CarouselControl
          className="carouselControl"
          direction="next"
          directionText=""
          onClickHandler={next}
        />
      </Carousel>
    </>
  );
};
export default Tutorial;
