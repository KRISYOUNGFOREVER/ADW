import React, { useState } from 'react';
import { Card, Typography, Space, Button, message, Breadcrumb } from 'antd';
import { ArrowLeftOutlined, RocketOutlined, StarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ModelInterface from '../components/ModelInterface';
import { SeedreamService, SeedreamGenerateParams } from '../services/seedreamService';

const { Title, Paragraph, Text } = Typography;

interface GenerateParams {
  prompt: string;
  size?: '1K' | '2K' | '4K';
  sequential_image_generation?: 'disabled' | 'auto';
  sequential_image_generation_options?: {
    max_images: number;
  };
  response_format?: 'url' | 'b64_json';
  stream?: boolean;
  watermark?: boolean;
  sourceImage?: string;
  referenceImages?: string[];
  generateMode?: 'text_to_image' | 'text_to_images' | 'image_to_image' | 'image_to_images' | 'images_to_image' | 'images_to_images';
}

interface ModelConfig {
  id: string;
  name: string;
  uuid: string;
  version: string;
  baseAlgo: string;
  commercialUse: boolean;
  status: string;
  description?: string;
}

const SeedreamPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleGenerate = async (params: GenerateParams, modelConfig?: ModelConfig) => {
    setLoading(true);
    setProgress(0);
    setGeneratedImages([]);

    try {
      // 检查 Seedream API 配置
      if (!SeedreamService.isConfigured()) {
        message.warning('Seedream API 未配置，使用模拟数据演示');
        
        // 模拟进度更新
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + Math.random() * 15;
          });
        }, 500);

        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 模拟生成的图片
        const mockImages = Array.from({ length: params.sequential_image_generation_options?.max_images || 1 }, (_, index) => 
          `https://picsum.photos/512/512?random=${Date.now() + index}`
        );

        clearInterval(progressInterval);
        setProgress(100);
        setGeneratedImages(mockImages);
        
        message.success(`成功生成 ${mockImages.length} 张图片！`);
        return;
      }

      // 实际调用 Seedream API
      message.info('正在提交生成请求...');
      
      // 转换参数格式
      const seedreamParams: SeedreamGenerateParams = {
        prompt: params.prompt,
        size: params.size || '2K',
        response_format: params.response_format || 'url',
        stream: params.stream || false,
        watermark: params.watermark !== undefined ? params.watermark : true,
        sequential_image_generation: params.sequential_image_generation || 'disabled'
      };

      // 根据生成模式设置参数
      if (params.generateMode === 'text_to_images' || params.generateMode === 'image_to_images' || params.generateMode === 'images_to_images') {
        // 组图生成模式
        seedreamParams.sequential_image_generation = 'auto';
        seedreamParams.stream = true; // 组图生成需要流式传输
        if (params.sequential_image_generation_options) {
          seedreamParams.sequential_image_generation_options = params.sequential_image_generation_options;
        }
      }

      // 设置参考图片
      if (params.generateMode === 'images_to_image' || params.generateMode === 'images_to_images') {
        // 多图参考模式
        if (params.referenceImages && params.referenceImages.length > 0) {
          seedreamParams.image = params.referenceImages;
        }
      } else if (params.generateMode === 'image_to_image' || params.generateMode === 'image_to_images') {
        // 单图参考模式
        if (params.sourceImage) {
          seedreamParams.image = params.sourceImage;
        }
      }

      setProgress(20);
      
      const response = await SeedreamService.generate(seedreamParams);
      
      setProgress(60);
      
      if (!response.data || response.data.length === 0) {
        throw new Error('生成请求失败，未返回图片数据');
      }

      // 提取生成的图片 URL
      const generatedUrls = response.data
        .map(item => item.url)
        .filter(url => url) as string[];

      setProgress(100);
      setGeneratedImages(generatedUrls);
      
      message.success(`成功生成 ${generatedUrls.length} 张图片！`);
      
    } catch (error: any) {
      console.error('Seedream 生成失败:', error);
      const errorMessage = error instanceof Error ? error.message : '生成失败，请重试';
      message.error(`生成失败: ${errorMessage}`);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* 头部导航 */}
      <div style={{ background: '#fff', padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Breadcrumb style={{ marginBottom: '16px' }}>
            <Breadcrumb.Item>
              <Button 
                type="link" 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/modules')}
                style={{ padding: 0 }}
              >
                功能模块
              </Button>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Seedream 4.0</Breadcrumb.Item>
          </Breadcrumb>

          <Space align="center" size="large">
            <div style={{ 
              width: '64px', 
              height: '64px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <RocketOutlined style={{ fontSize: '32px', color: '#fff' }} />
            </div>
            <div>
              <Title level={2} style={{ margin: 0 }}>
                Seedream 4.0
                <StarOutlined style={{ color: '#faad14', marginLeft: '8px' }} />
              </Title>
              <Paragraph style={{ margin: '8px 0 0 0', color: '#666' }}>
                最新版本的Seedream模型，支持高质量图像生成，适合各种创意场景
              </Paragraph>
            </div>
          </Space>
        </div>
      </div>

      {/* 功能介绍 */}
      <div style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Card style={{ marginBottom: '24px' }}>
            <Title level={4}>✨ 模型特色</Title>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', background: '#f8f9ff', borderRadius: '8px', border: '1px solid #e6f0ff' }}>
                <Text strong style={{ color: '#1890ff' }}>🎨 高质量生成</Text>
                <div style={{ marginTop: '8px', color: '#666' }}>
                  基于最新算法，生成细节丰富、质量卓越的图像
                </div>
              </div>
              <div style={{ padding: '16px', background: '#f6ffed', borderRadius: '8px', border: '1px solid #d9f7be' }}>
                <Text strong style={{ color: '#52c41a' }}>⚡ 快速响应</Text>
                <div style={{ marginTop: '8px', color: '#666' }}>
                  优化的推理引擎，大幅提升生成速度
                </div>
              </div>
              <div style={{ padding: '16px', background: '#fff7e6', borderRadius: '8px', border: '1px solid #ffd591' }}>
                <Text strong style={{ color: '#fa8c16' }}>🎯 精准控制</Text>
                <div style={{ marginTop: '8px', color: '#666' }}>
                  支持多种参数调节，精确控制生成效果
                </div>
              </div>
              <div style={{ padding: '16px', background: '#f9f0ff', borderRadius: '8px', border: '1px solid #d3adf7' }}>
                <Text strong style={{ color: '#722ed1' }}>💼 商业授权</Text>
                <div style={{ marginTop: '8px', color: '#666' }}>
                  支持商业使用，适合各种商业项目需求
                </div>
              </div>
            </div>
          </Card>

          {/* 模型界面 */}
          <ModelInterface
            modelType="seedream"
            onGenerate={handleGenerate}
            loading={loading}
            progress={progress}
            generatedImages={generatedImages}
          />
        </div>
      </div>
    </div>
  );
};

export default SeedreamPage;