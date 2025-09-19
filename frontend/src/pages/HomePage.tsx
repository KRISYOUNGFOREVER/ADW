import React, { useEffect, useState } from 'react';
import { Layout } from 'antd';
import Header from '../components/Header';
import HeroCarousel from '../components/HeroCarousel';
import ProductShowcase from '../components/ProductShowcase';
import './HomePage.css';

const { Content, Footer } = Layout;

const HomePage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Layout className="home-layout">
      <Header />
      
      <Content className="home-content">
        {/* 主轮播图 */}
        <section className="hero-section">
          <HeroCarousel />
        </section>

        {/* 产品展示区域 */}
        <section className="showcase-section">
          <ProductShowcase />
        </section>

        {/* 特色介绍区域 */}
        <section className="features-section">
          <div className="features-container">
            <div className="feature-item">
              <div className="feature-icon">
                <div className="icon-circle">
                  <span className="icon-text">AI</span>
                </div>
              </div>
              <h3 className="feature-title">智能生成</h3>
              <p className="feature-description">
                运用最先进的AI技术，结合传统工艺美学，创造独具匠心的艺术作品
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <div className="icon-circle">
                  <span className="icon-text">艺</span>
                </div>
              </div>
              <h3 className="feature-title">传统工艺</h3>
              <p className="feature-description">
                传承千年陶瓷文化精髓，将传统技艺与现代设计理念完美融合
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <div className="icon-circle">
                  <span className="icon-text">创</span>
                </div>
              </div>
              <h3 className="feature-title">创新设计</h3>
              <p className="feature-description">
                突破传统设计边界，为每一件作品注入现代美学与文化内涵
              </p>
            </div>
          </div>
        </section>
      </Content>

      <Footer className="home-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>贝瑞文化</h3>
            <p>传统工艺与现代科技的完美融合</p>
          </div>
          
          <div className="footer-links">
            <div className="link-group">
              <h4>产品服务</h4>
              <a href="/seedream">Seedream 4.0</a>
              <a href="/modules">功能模块</a>
              <a href="/test">功能测试</a>
            </div>
            
            <div className="link-group">
              <h4>作品展示</h4>
              <a href="/showcase/xiaomao">小茅生图</a>
              <a href="/showcase/wangxuetao">王雪涛生图</a>
              <a href="/showcase/qixing">器型分类</a>
            </div>
            
            <div className="link-group">
              <h4>关于我们</h4>
              <a href="/about">公司介绍</a>
              <a href="/contact">联系我们</a>
              <a href="/help">帮助中心</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 贝瑞文化. 保留所有权利.</p>
        </div>
      </Footer>
    </Layout>
  );
};

export default HomePage;