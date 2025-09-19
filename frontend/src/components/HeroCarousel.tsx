import React, { useState, useEffect } from 'react';
import { Carousel, Button } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import './HeroCarousel.css';

// 导入轮播图图片
import slide1 from '../assets/images/carousel/b8a8406e1e9fdc0a11e6939f223e4c64f2ba5cd781afae0b9b66405da60b0cdf.png';
import slide2 from '../assets/images/carousel/file___media_Photo_4384_IMG_1754061701_4365_IMG_4365.png';
import slide3 from '../assets/images/carousel/图片风格转换.png';

interface CarouselSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
}

const HeroCarousel: React.FC = () => {
  const [slides] = useState<CarouselSlide[]>([
    {
      id: 1,
      title: '贝瑞文化 AI 设计平台',
      subtitle: '传统工艺与现代科技的完美融合',
      description: '运用先进的AI技术，传承千年陶瓷文化，创造独具匠心的艺术作品',
      image: slide1,
      buttonText: '开始创作',
      buttonLink: '/modules'
    },
    {
      id: 2,
      title: 'Seedream 4.0 智能生图',
      subtitle: '让创意无限延伸',
      description: '基于火山引擎的强大AI模型，支持文生图、图生图、多图参考等多种创作模式',
      image: slide2,
      buttonText: '体验生图',
      buttonLink: '/seedream'
    },
    {
      id: 3,
      title: '王雪涛花鸟艺术',
      subtitle: '传统国画的数字化传承',
      description: '以王雪涛大师的花鸟画风格为基础，结合AI技术创造现代陶瓷艺术',
      image: slide3,
      buttonText: '探索艺术',
      buttonLink: '/modules'
    }
  ]);

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const handleSlideChange = (index: number) => {
    setCurrentSlide(index);
  };

  const handleButtonClick = (link: string) => {
    window.location.href = link;
  };

  return (
    <div className="hero-carousel">
      <Carousel
        autoplay
        autoplaySpeed={5000}
        dots={false}
        effect="fade"
        beforeChange={(_, next) => setCurrentSlide(next)}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="carousel-slide">
            <div 
              className="slide-background"
              style={{ 
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${slide.image})` 
              }}
            >
              <div className="slide-content">
                <div className="slide-text">
                  <h1 className="slide-title">{slide.title}</h1>
                  <h2 className="slide-subtitle">{slide.subtitle}</h2>
                  <p className="slide-description">{slide.description}</p>
                  <Button 
                    type="primary" 
                    size="large"
                    className="slide-button"
                    icon={<ArrowRightOutlined />}
                    onClick={() => handleButtonClick(slide.buttonLink)}
                  >
                    {slide.buttonText}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
      
      {/* 自定义指示器 */}
      <div className="carousel-indicators">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => handleSlideChange(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;