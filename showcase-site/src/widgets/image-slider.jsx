import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

// Import images directly
import image1 from "./slider-images/image1.jpg";
import image2 from "./slider-images/image2.jpg";
import image3 from "./slider-images/image3.jpg";
import image4 from "./slider-images/image4.jpg";
import image5 from "./slider-images/image5.jpg";

const responsive = {
    desktop: { breakpoint: { max: 3000, min: 1024 }, items: 2, slidesToSlide: 1 },
    tablet: { breakpoint: { max: 1024, min: 768 }, items: 2, slidesToSlide: 1 },
    mobile: { breakpoint: { max: 767, min: 0 }, items: 1, slidesToSlide: 1 }
  };
  
  // Define image array with imported images
  const sliderImages = [
    { url: image1 },
    { url: image2 },
    { url: image3 },
    { url: image4 },
    { url: image5 }
  ];
  
  const ImageSlider = () => {
    return (

      <div className="mx-auto w-full max-w-[900px] min-w-6">
        <Carousel
          responsive={responsive}
          autoPlay={true}
          autoPlaySpeed={3000}
          swipeable={true}
          //draggable={true}
          showDots={true}
          infinite={true}
          partialVisible={false}
          dotListClass="mt-5 flex justify-center"
        >
          {sliderImages.map((image, index) => (
            <div className="overflow-hidden rounded-lg shadow-md mx-[10px]" key={index}>
              <img
                className="w-full h-auto max-h-[500px] object-cover rounded-lg"
                src={image.url}
                alt={`slide-${index + 1}`}
              />
            </div>
          ))}
        </Carousel>
      </div>
    );
  };
  
export default ImageSlider;