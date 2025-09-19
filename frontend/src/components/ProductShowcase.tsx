import React, { useState, useEffect, useRef } from 'react';
import { Card, Typography } from 'antd';
import './ProductShowcase.css';

// 导入小茅图片
import xiaomao1 from '../assets/images/products/xiaomao/小茅春节-1.png';
import xiaomao2 from '../assets/images/products/xiaomao/小茅秋天-1.png';
import xiaomao3 from '../assets/images/products/xiaomao/小茅端午节-1.png';
import xiaomao4 from '../assets/images/products/xiaomao/小茅端午节-2.png';
import xiaomao5 from '../assets/images/products/xiaomao/3c15050fca7114292cb219a148c5e7c.png';

// 导入上作花纸图片
import shangzuo1 from '../assets/images/products/shangzuo/file___media_Photo_4384_IMG_1754061701_4365_IMG_4365.png';
import shangzuo2 from '../assets/images/products/shangzuo/file___media_Photo_4385_IMG_1754061706_4366_IMG_4366.png';

// 导入王雪涛图片
import wangxuetao1 from '../assets/images/products/wangxuetao/1.png';
import wangxuetao2 from '../assets/images/products/wangxuetao/图片风格转换.png';
import wangxuetao3 from '../assets/images/products/wangxuetao/图片风格转换 (1).png';
import wangxuetao4 from '../assets/images/products/wangxuetao/图片风格转换 (2).png';
import wangxuetao5 from '../assets/images/products/wangxuetao/图片风格转换 (3).png';

// 导入品茗杯图片
import pinmingbei1 from '../assets/images/products/qixing/pinmingbei/330087f0b735b55830e4c33942fe6873f3ab397200e981f8483a02e433deb3be.png';
import pinmingbei2 from '../assets/images/products/qixing/pinmingbei/56da64577d44e1a699de975337fb403a1e330f2953d5e61ccf852e2548e74b04.png';
import pinmingbei3 from '../assets/images/products/qixing/pinmingbei/6504024e2b6ecd7cb33ac9bc0c433e12ed9c8c164bb1b283acf85f6a4d669bb7.png';
import pinmingbei4 from '../assets/images/products/qixing/pinmingbei/a5d9340f8c208354a37cb51a1008d6c3af9ea2c7f7752728a623e7b28812c168.png';
import pinmingbei5 from '../assets/images/products/qixing/pinmingbei/fa47920f522cbb1c2132149509427bdaf96ffe6056917f2c377b4586800ecfa5.png';

// 导入茶叶罐图片
import chayegan1 from '../assets/images/products/qixing/chayegan/595980681-ccfa5d67c3da8a4d63624551064ba5011d7119bc38b865ba15acf67affbacdd8.png';
import chayegan2 from '../assets/images/products/qixing/chayegan/c0869416c34c9c12b3765f60f070db67618208b1bbadef704ac5fe4531a1aa3f.png';
import chayegan3 from '../assets/images/products/qixing/chayegan/cb995b8cee5ec967b29bf42859596cfd260e77bda77dcaa6834e89e97a120062.png';

// 导入茶壶图片
import chahu1 from '../assets/images/products/qixing/chahu/595980681-ccfa5d67c3da8a4d63624551064ba5011d7119bc38b865ba15acf67affbacdd8.png';
import chahu2 from '../assets/images/products/qixing/chahu/b8a8406e1e9fdc0a11e6939f223e4c64f2ba5cd781afae0b9b66405da60b0cdf.png';
import chahu3 from '../assets/images/products/qixing/chahu/e9e7afc40c6b05660344fc0fd69019b24203a40fa9a78156ce6d347efbbfad5e.png';
import chahu4 from '../assets/images/products/qixing/chahu/f48ea4193de3ea47d4925b62bba40e4272273173da90e2b145be143419f6447b.png';
import chahu5 from '../assets/images/products/qixing/chahu/f4c01a08e80340d939724899a0b7463a9bde4784f0251a9bf1611c436f0c5d7a.png';

const { Title, Text } = Typography;

interface ProductImage {
  id: string;
  url: string;
  title: string;
}

interface ProductCategory {
  id: string;
  name: string;
  description: string;
  images: ProductImage[];
}

const ProductShowcase: React.FC = () => {
  const [categories] = useState<ProductCategory[]>([
    {
      id: 'xiaomao',
      name: '小茅生图',
      description: '传统小茅风格的AI生成作品',
      images: [
        { id: '1', url: xiaomao1, title: '小茅春节' },
        { id: '2', url: xiaomao2, title: '小茅秋天' },
        { id: '3', url: xiaomao3, title: '小茅端午节' },
        { id: '4', url: xiaomao4, title: '小茅端午节2' },
        { id: '5', url: xiaomao5, title: '小茅作品5' },
      ]
    },
    {
      id: 'shangzuo',
      name: '上作花纸生图',
      description: '精美花纸图案的AI创作',
      images: [
        { id: '1', url: shangzuo1, title: '花纸作品1' },
        { id: '2', url: shangzuo2, title: '花纸作品2' },
        { id: '3', url: shangzuo1, title: '花纸作品3' },
        { id: '4', url: shangzuo2, title: '花纸作品4' },
        { id: '5', url: shangzuo1, title: '花纸作品5' },
      ]
    },
    {
      id: 'wangxuetao',
      name: '王雪涛生图',
      description: '王雪涛花鸟画风格的AI作品',
      images: [
        { id: '1', url: wangxuetao1, title: '王雪涛作品1' },
        { id: '2', url: wangxuetao2, title: '图片风格转换' },
        { id: '3', url: wangxuetao3, title: '图片风格转换1' },
        { id: '4', url: wangxuetao4, title: '图片风格转换2' },
        { id: '5', url: wangxuetao5, title: '图片风格转换3' },
      ]
    },
    {
      id: 'pinmingbei',
      name: '品茗杯',
      description: '精致品茗杯器型设计',
      images: [
        { id: '1', url: pinmingbei1, title: '品茗杯1' },
        { id: '2', url: pinmingbei2, title: '品茗杯2' },
        { id: '3', url: pinmingbei3, title: '品茗杯3' },
        { id: '4', url: pinmingbei4, title: '品茗杯4' },
        { id: '5', url: pinmingbei5, title: '品茗杯5' },
      ]
    },
    {
      id: 'chayegan',
      name: '茶叶罐',
      description: '实用美观的茶叶罐设计',
      images: [
        { id: '1', url: chayegan1, title: '茶叶罐1' },
        { id: '2', url: chayegan2, title: '茶叶罐2' },
        { id: '3', url: chayegan3, title: '茶叶罐3' },
        { id: '4', url: chayegan1, title: '茶叶罐4' },
        { id: '5', url: chayegan2, title: '茶叶罐5' },
      ]
    },
    {
      id: 'chahu',
      name: '茶壶',
      description: '传统与现代结合的茶壶造型',
      images: [
        { id: '1', url: chahu1, title: '茶壶1' },
        { id: '2', url: chahu2, title: '茶壶2' },
        { id: '3', url: chahu3, title: '茶壶3' },
        { id: '4', url: chahu4, title: '茶壶4' },
        { id: '5', url: chahu5, title: '茶壶5' },
      ]
    }
  ]);

  const [currentIndexes, setCurrentIndexes] = useState<{ [key: string]: number }>({});
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const intervalRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // 初始化每个分类的当前索引
  useEffect(() => {
    const initialIndexes: { [key: string]: number } = {};
    categories.forEach(category => {
      initialIndexes[category.id] = 0;
    });
    setCurrentIndexes(initialIndexes);
  }, [categories]);

  // 设置轮播定时器
  useEffect(() => {
    categories.forEach(category => {
      const speed = hoveredCategory === category.id ? 800 : 3000; // 悬停时加速
      
      if (intervalRefs.current[category.id]) {
        clearInterval(intervalRefs.current[category.id]);
      }

      intervalRefs.current[category.id] = setInterval(() => {
        setCurrentIndexes(prev => ({
          ...prev,
          [category.id]: (prev[category.id] + 1) % category.images.length
        }));
      }, speed);
    });

    return () => {
      Object.values(intervalRefs.current).forEach(interval => {
        if (interval) clearInterval(interval);
      });
    };
  }, [categories, hoveredCategory]);

  const handleCategoryHover = (categoryId: string, isHovering: boolean) => {
    setHoveredCategory(isHovering ? categoryId : null);
  };

  const handleImageClick = (category: ProductCategory, imageIndex: number) => {
    // 可以添加图片点击处理逻辑，比如打开大图或跳转到详情页
    console.log(`Clicked on ${category.name} - Image ${imageIndex + 1}`);
  };

  return (
    <div className="product-showcase">
      <div className="showcase-header">
        <Title level={2} className="showcase-title">
          AI 生成作品展示
        </Title>
        <Text className="showcase-subtitle">
          探索传统工艺与现代AI技术的完美融合
        </Text>
      </div>

      <div className="showcase-grid">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="category-card"
            hoverable
            onMouseEnter={() => handleCategoryHover(category.id, true)}
            onMouseLeave={() => handleCategoryHover(category.id, false)}
          >
            <div className="category-header">
              <Title level={4} className="category-name">
                {category.name}
              </Title>
              <Text className="category-description">
                {category.description}
              </Text>
            </div>

            <div className="image-carousel">
              <div 
                className="image-container"
                onClick={() => handleImageClick(category, currentIndexes[category.id] || 0)}
              >
                {category.images.map((image, index) => (
                  <img
                    key={image.id}
                    src={image.url}
                    alt={image.title}
                    className={`carousel-image ${
                      index === (currentIndexes[category.id] || 0) ? 'active' : ''
                    }`}
                    onError={(e) => {
                      // 图片加载失败时显示占位图
                      console.log('Image load error:', image.url);
                      (e.target as HTMLImageElement).src = `https://picsum.photos/300/300?random=${index}&blur=1`;
                    }}
                  />
                ))}
                
                {/* 轮播指示器 */}
                <div className="carousel-indicators">
                  {category.images.map((_, index) => (
                    <div
                      key={index}
                      className={`indicator ${
                        index === (currentIndexes[category.id] || 0) ? 'active' : ''
                      }`}
                    />
                  ))}
                </div>

                {/* 悬停时显示加速提示 */}
                {hoveredCategory === category.id && (
                  <div className="speed-indicator">
                    <Text>快速轮播中...</Text>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductShowcase;