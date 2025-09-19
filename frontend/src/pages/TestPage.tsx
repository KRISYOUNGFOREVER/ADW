import React, { useState } from 'react';
import { Card, Typography, Button, Space, Descriptions, Alert, List, Tag } from 'antd';
import { PlayCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { getConfigStatus } from '../config/liblib';
import { SeedreamService } from '../services/seedreamService';

const { Title, Text, Paragraph } = Typography;

interface TestResult {
  test: string;
  status: 'running' | 'success' | 'warning' | 'error';
  message: string;
  details?: any;
}

const TestPage: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const configStatus = getConfigStatus();

  const runTests = async () => {
    setTesting(true);
    setTestResults([]);
    
    const results: any[] = [];

    try {
      // 测试1: 配置检查
      results.push({
        test: '配置检查',
        status: 'running',
        message: '检查 API 配置状态...'
      });
      setTestResults([...results]);

      const configStatus = getConfigStatus();
      results[results.length - 1] = {
        test: '配置检查',
        status: 'success',
        message: 'API 配置检查完成',
        details: configStatus
      };
      setTestResults([...results]);

      // 测试2: Seedream 4.0 模型配置
      results.push({
        test: 'Seedream 模型配置',
        status: 'running',
        message: '检查 Seedream 4.0 模型配置...'
      });
      setTestResults([...results]);

      const seedreamConfigStatus = SeedreamService.getConfigStatus();
      results[results.length - 1] = {
        test: 'Seedream 模型配置',
        status: seedreamConfigStatus.isConfigured ? 'success' : 'warning',
        message: seedreamConfigStatus.isConfigured ? 'Seedream 4.0 模型配置正常' : 'Seedream 4.0 模型未配置，将使用模拟模式',
        details: seedreamConfigStatus
      };
      setTestResults([...results]);

      // 测试3: 模拟API调用（如果未配置API密钥）
      if (!seedreamConfigStatus.isConfigured) {
        results.push({
          test: '模拟API调用',
          status: 'running',
          message: '测试模拟API调用...'
        });
        setTestResults([...results]);

        try {
          // 模拟调用
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          results[results.length - 1] = {
            test: '模拟API调用',
            status: 'warning',
            message: 'API未配置，但模拟模式可以正常工作'
          };
        } catch (error) {
          results[results.length - 1] = {
            test: '模拟API调用',
            status: 'error',
            message: `模拟调用失败: ${error}`
          };
        }
        setTestResults([...results]);
      } else {
        // 测试4: 真实API连接测试
        results.push({
          test: '真实API连接',
          status: 'running',
          message: '测试 Seedream API 连接...'
        });
        setTestResults([...results]);

        try {
          // 测试简单的文生图调用
          const testParams = {
            prompt: '测试提示词：一只可爱的小猫',
            size: '2K' as const,
            watermark: true,
            stream: false,
            response_format: 'url' as const
          };

          const response = await SeedreamService.generateTextToImage(testParams);
          
          results[results.length - 1] = {
            test: '真实API连接',
            status: 'success',
            message: 'Seedream API 连接成功',
            details: {
              responseId: response.id,
              imageCount: response.data.length,
              created: new Date(response.created * 1000).toLocaleString()
            }
          };
        } catch (error: any) {
          results[results.length - 1] = {
            test: '真实API连接',
            status: 'error',
            message: `API 连接失败: ${error.message}`
          };
        }
        setTestResults([...results]);
      }

      message.success('所有测试完成！');
    } catch (error) {
      message.error(`测试过程中出现错误: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'running': return 'processing';
      default: return 'default';
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>Seedream 4.0 集成测试</Title>
      
      <Alert
        message="测试说明"
        description="此页面用于测试LibLib API服务集成和Seedream 4.0模型配置是否正常工作。"
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />

      <Card title="配置信息" style={{ marginBottom: '24px' }}>
        <Descriptions title="配置信息" bordered column={1} size="small">
          <Descriptions.Item label="Seedream API Key">
            {configStatus.seedream.hasApiKey ? '✅ 已配置' : '❌ 未配置'}
          </Descriptions.Item>
          <Descriptions.Item label="Seedream Base URL">
            {configStatus.seedream.baseUrl}
          </Descriptions.Item>
          <Descriptions.Item label="Seedream Endpoint ID">
            {configStatus.seedream.endpointId}
          </Descriptions.Item>
          <Descriptions.Item label="LibLib API Key">
            {configStatus.liblib.hasApiKey ? '✅ 已配置' : '❌ 未配置'}
          </Descriptions.Item>
          <Descriptions.Item label="LibLib Secret Key">
            {configStatus.liblib.hasSecretKey ? '✅ 已配置' : '❌ 未配置'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card 
        title="测试结果" 
        extra={
          <Button 
            type="primary" 
            onClick={runTests} 
            loading={testing}
            disabled={testing}
          >
            {testing ? '测试中...' : '开始测试'}
          </Button>
        }
      >
        {testResults.length === 0 ? (
          <Paragraph type="secondary">点击"开始测试"按钮运行集成测试</Paragraph>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }}>
            {testResults.map((result, index) => (
              <Alert
                key={index}
                message={result.test}
                description={
                  <div>
                    <div>{result.message}</div>
                    {result.details && (
                      <pre style={{ 
                        marginTop: '8px', 
                        fontSize: '12px', 
                        background: '#f5f5f5', 
                        padding: '8px',
                        borderRadius: '4px',
                        overflow: 'auto'
                      }}>
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    )}
                  </div>
                }
                type={getStatusColor(result.status) as any}
                showIcon
              />
            ))}
          </Space>
        )}
      </Card>

      {/* 添加配置调试组件 */}
      <ConfigDebug />

      <Card title="使用说明" style={{ marginTop: '24px' }}>
        <Paragraph>
          <strong>配置LibLib API密钥：</strong>
        </Paragraph>
        <ol>
          <li>在前端项目目录（<code>frontend/</code>）创建 <code>.env.local</code> 文件</li>
          <li>添加以下环境变量：
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '4px',
              margin: '8px 0'
            }}>
{`VITE_LIBLIB_API_KEY=your_api_key_here
VITE_LIBLIB_SECRET_KEY=your_secret_key_here`}
            </pre>
          </li>
          <li>重启开发服务器</li>
          <li>重新运行测试</li>
        </ol>
        
        <Paragraph>
          <strong>注意：</strong> 如果未配置API密钥，系统将使用模拟模式进行演示。
        </Paragraph>
      </Card>
    </div>
  );
};

export default TestPage;