import React from 'react';
import { Card, Typography, Tag, Space } from 'antd';
import { LIBLIB_CONFIG, isLiblibConfigured } from '../config/liblib';

const { Title, Text, Paragraph } = Typography;

const ConfigDebug: React.FC = () => {
  const configStatus = {
    apiKey: import.meta.env.VITE_LIBLIB_API_KEY,
    secretKey: import.meta.env.VITE_LIBLIB_SECRET_KEY,
    hasApiKey: !!import.meta.env.VITE_LIBLIB_API_KEY,
    hasSecretKey: !!import.meta.env.VITE_LIBLIB_SECRET_KEY,
    isConfigured: isLiblibConfigured(),
    configApiKey: LIBLIB_CONFIG.API_KEY,
    configSecretKey: LIBLIB_CONFIG.SECRET_KEY
  };

  return (
    <Card title="LibLib API 配置调试信息" style={{ margin: '20px 0' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>环境变量状态：</Text>
          <div style={{ marginLeft: 20 }}>
            <p>
              <Text>VITE_LIBLIB_API_KEY: </Text>
              <Tag color={configStatus.hasApiKey ? 'green' : 'red'}>
                {configStatus.hasApiKey ? '已设置' : '未设置'}
              </Tag>
              {configStatus.apiKey && (
                <Text code>{configStatus.apiKey.substring(0, 10)}...</Text>
              )}
            </p>
            <p>
              <Text>VITE_LIBLIB_SECRET_KEY: </Text>
              <Tag color={configStatus.hasSecretKey ? 'green' : 'red'}>
                {configStatus.hasSecretKey ? '已设置' : '未设置'}
              </Tag>
              {configStatus.secretKey && (
                <Text code>{configStatus.secretKey.substring(0, 10)}...</Text>
              )}
            </p>
          </div>
        </div>

        <div>
          <Text strong>配置文件状态：</Text>
          <div style={{ marginLeft: 20 }}>
            <p>
              <Text>LIBLIB_CONFIG.API_KEY: </Text>
              <Tag color={configStatus.configApiKey ? 'green' : 'red'}>
                {configStatus.configApiKey ? '已加载' : '未加载'}
              </Tag>
              {configStatus.configApiKey && (
                <Text code>{configStatus.configApiKey.substring(0, 10)}...</Text>
              )}
            </p>
            <p>
              <Text>LIBLIB_CONFIG.SECRET_KEY: </Text>
              <Tag color={configStatus.configSecretKey ? 'green' : 'red'}>
                {configStatus.configSecretKey ? '已加载' : '未加载'}
              </Tag>
              {configStatus.configSecretKey && (
                <Text code>{configStatus.configSecretKey.substring(0, 10)}...</Text>
              )}
            </p>
          </div>
        </div>

        <div>
          <Text strong>整体配置状态：</Text>
          <Tag color={configStatus.isConfigured ? 'green' : 'red'} style={{ marginLeft: 10 }}>
            {configStatus.isConfigured ? '配置完成' : '配置未完成'}
          </Tag>
        </div>

        <div>
          <Text strong>所有环境变量：</Text>
          <Paragraph>
            <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '10px' }}>
              {JSON.stringify(import.meta.env, null, 2)}
            </pre>
          </Paragraph>
        </div>
      </Space>
    </Card>
  );
};

export default ConfigDebug;