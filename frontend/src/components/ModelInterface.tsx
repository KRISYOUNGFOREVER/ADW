import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Slider,
  Button,
  Upload,
  Row,
  Col,
  Space,
  Typography,
  Divider,
  Switch,
  InputNumber,
  message,
  Progress,
  Image,
  Tag
} from 'antd';
import {
  CloudUploadOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  PictureOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { uploadImage, validateImageFile } from '../utils/imageUpload';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

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

interface ModelInterfaceProps {
  modelType: 'seedream' | 'custom' | 'star3';
  onGenerate: (params: GenerateParams, modelConfig?: ModelConfig) => void;
  loading?: boolean;
  progress?: number;
  generatedImages?: string[];
}

const ModelInterface: React.FC<ModelInterfaceProps> = ({
  modelType,
  onGenerate,
  loading = false,
  progress = 0,
  generatedImages = []
}) => {
  const [form] = Form.useForm();
  const [selectedModel, setSelectedModel] = useState<ModelConfig | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [advancedMode, setAdvancedMode] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [generateMode, setGenerateMode] = useState<'text_to_image' | 'text_to_images' | 'image_to_image' | 'image_to_images' | 'images_to_image' | 'images_to_images'>('text_to_image');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);

  // 预设的模型配置
  const modelConfigs: Record<string, ModelConfig[]> = {
    seedream: [
      {
        id: 'seedream-4.0',
        name: 'Seedream 4.0',
        uuid: '12f2958836864b9c9e8ef18d560ce04c',
        version: '4.0',
        baseAlgo: 'F.1',
        commercialUse: true,
        status: '推荐使用',
        description: '最新版本的Seedream模型，支持高质量图像生成'
      }
    ],
    star3: [
      {
        id: 'star3-alpha',
        name: 'Star-3 Alpha',
        uuid: '5d7e67009b344550bc1aa6ccbfa1d7f4',
        version: 'Alpha',
        baseAlgo: 'Star-3',
        commercialUse: true,
        status: '推荐使用',
        description: '星流Star-3 Alpha，搭载自带LoRA推荐算法'
      }
    ],
    custom: [
      {
        id: 'wangxuetao-v2',
        name: 'wangxuetao VER2',
        uuid: '23c57c51469c456c8e00c1fe0d06daf1',
        version: '2.0',
        baseAlgo: 'F.1',
        commercialUse: false,
        status: '推荐使用',
        description: '自定义训练模型，适合特定风格生成'
      }
    ]
  };

  // 采样器选项
  const samplerOptions = [
    { value: 1, label: 'Euler' },
    { value: 2, label: 'Euler a' },
    { value: 3, label: 'Heun' },
    { value: 4, label: 'DPM2' },
    { value: 5, label: 'DPM2 a' },
    { value: 15, label: 'DPM++ 2M Karras' },
    { value: 16, label: 'DPM++ SDE Karras' }
  ];

  // 宽高比选项
  const aspectRatioOptions = [
    { value: 'square', label: '正方形 (1:1)', size: '1024×1024' },
    { value: 'portrait', label: '竖版 (3:4)', size: '768×1024' },
    { value: 'landscape', label: '横版 (16:9)', size: '1280×720' }
  ];

  useEffect(() => {
    // 默认选择第一个模型
    const models = modelConfigs[modelType];
    if (models && models.length > 0) {
      setSelectedModel(models[0]);
      form.setFieldsValue({ modelId: models[0].id });
    }
  }, [modelType, form]);

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    
    try {
      // 验证图片文件
      validateImageFile(file as File);
      
      // 上传图片并获取 base64
      const result = await uploadImage(file as File);
      
      if (generateMode === 'images_to_image' || generateMode === 'images_to_images') {
        // 多图参考模式，添加到参考图列表
        setReferenceImages(prev => [...prev, result.url]);
      } else {
        // 单图模式
        setUploadedImage(result.url);
      }
      
      onSuccess?.(result.url);
      message.success('图片上传成功');
    } catch (error: any) {
      console.error('图片上传失败:', error);
      message.error(error.message || '图片上传失败');
      onError?.(error);
    }
  };

  const handleRemoveReferenceImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = () => {
    form.validateFields().then((values) => {
      const params: GenerateParams = {
        prompt: values.prompt,
        size: values.size || '2K',
        response_format: 'url',
        stream: false,
        watermark: values.watermark !== undefined ? values.watermark : true,
        generateMode: generateMode
      };

      // 根据生成模式设置参数
      if (generateMode === 'text_to_images' || generateMode === 'image_to_images' || generateMode === 'images_to_images') {
        // 组图生成模式
        params.sequential_image_generation = 'auto';
        params.sequential_image_generation_options = {
          max_images: values.maxImages || 4
        };
        params.stream = true; // 组图生成需要流式传输
      } else {
        // 单图生成模式
        params.sequential_image_generation = 'disabled';
      }

      // 设置参考图片
      if (generateMode === 'images_to_image' || generateMode === 'images_to_images') {
        // 多图参考模式
        params.referenceImages = referenceImages;
      } else if (generateMode === 'image_to_image' || generateMode === 'image_to_images') {
        // 单图参考模式
        params.sourceImage = uploadedImage;
      }

      onGenerate(params, selectedModel || undefined);
    });
  };

  const resetForm = () => {
    form.resetFields();
    setUploadedImage('');
    setFileList([]);
    setReferenceImages([]);
    setGenerateMode('text_to_image');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Row gutter={[24, 24]}>
        {/* 左侧参数配置 */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <SettingOutlined />
                <span>模型配置</span>
              </Space>
            }
            extra={
              <Switch
                checkedChildren="高级"
                unCheckedChildren="简单"
                checked={advancedMode}
                onChange={setAdvancedMode}
              />
            }
          >
            <Form
              form={form}
              layout="vertical"
            >
              {/* 模型选择 */}
              <Form.Item label="选择模型" name="modelId">
                <Select
                  placeholder="选择要使用的模型"
                  onChange={(value) => {
                    const model = modelConfigs[modelType].find(m => m.id === value);
                    setSelectedModel(model || null);
                  }}
                >
                  {modelConfigs[modelType]?.map((model) => (
                    <Option key={model.id} value={model.id}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{model.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {model.baseAlgo} • {model.version} • 
                          <Tag color={model.commercialUse ? 'green' : 'orange'} size="small">
                            {model.commercialUse ? '商用' : '非商用'}
                          </Tag>
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* 提示词 */}
              <Form.Item
                label="提示词"
                name="prompt"
                rules={[{ required: true, message: '请输入提示词' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="描述你想要生成的图像..."
                  showCount
                  maxLength={2000}
                />
              </Form.Item>

              {/* 生成模式选择 */}
              <Form.Item label="生成模式">
                <Select
                  value={generateMode}
                  onChange={(value) => {
                    setGenerateMode(value);
                    // 切换模式时清空相关状态
                    if (!value.includes('images_to')) {
                      setReferenceImages([]);
                    }
                    if (!value.includes('image_to') && !value.includes('images_to')) {
                      setUploadedImage('');
                      setFileList([]);
                    }
                  }}
                >
                  <Option value="text_to_image">
                    <div>
                      <div style={{ fontWeight: 'bold' }}>文生图 - 单张</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        根据文字描述生成单张图片
                      </div>
                    </div>
                  </Option>
                  <Option value="text_to_images">
                    <div>
                      <div style={{ fontWeight: 'bold' }}>文生图 - 组图</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        根据文字描述生成一组连贯图片
                      </div>
                    </div>
                  </Option>
                  <Option value="image_to_image">
                    <div>
                      <div style={{ fontWeight: 'bold' }}>图生图 - 单张</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        基于单张参考图生成单张图片
                      </div>
                    </div>
                  </Option>
                  <Option value="image_to_images">
                    <div>
                      <div style={{ fontWeight: 'bold' }}>图生图 - 组图</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        基于单张参考图生成一组图片
                      </div>
                    </div>
                  </Option>
                  <Option value="images_to_image">
                    <div>
                      <div style={{ fontWeight: 'bold' }}>多图参考 - 单张</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        基于多张参考图生成单张图片
                      </div>
                    </div>
                  </Option>
                  <Option value="images_to_images">
                    <div>
                      <div style={{ fontWeight: 'bold' }}>多图参考 - 组图</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        基于多张参考图生成一组图片
                      </div>
                    </div>
                  </Option>
                </Select>
              </Form.Item>

              {/* 图片上传 */}
              {(generateMode === 'images_to_image' || generateMode === 'images_to_images') ? (
                <Form.Item label="参考图片（多张）">
                  <Upload
                    listType="picture-card"
                    customRequest={handleUpload}
                    showUploadList={false}
                    accept="image/*"
                  >
                    <div>
                      <CloudUploadOutlined />
                      <div style={{ marginTop: 8 }}>添加参考图</div>
                    </div>
                  </Upload>
                  
                  {referenceImages.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <Text strong>已上传的参考图片：</Text>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                        {referenceImages.map((url, index) => (
                          <div key={index} style={{ position: 'relative' }}>
                            <Image
                              width={80}
                              height={80}
                              src={url}
                              style={{ objectFit: 'cover', borderRadius: 4 }}
                            />
                            <Button
                              type="text"
                              size="small"
                              danger
                              style={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                minWidth: 20,
                                height: 20,
                                borderRadius: '50%',
                                background: '#ff4d4f',
                                color: 'white'
                              }}
                              onClick={() => handleRemoveReferenceImage(index)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Form.Item>
              ) : (generateMode === 'image_to_image' || generateMode === 'image_to_images') ? (
                <Form.Item label="参考图片（单张）">
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    customRequest={handleUpload}
                    onChange={({ fileList }) => setFileList(fileList)}
                    maxCount={1}
                    accept="image/*"
                  >
                    {fileList.length === 0 && (
                      <div>
                        <CloudUploadOutlined />
                        <div style={{ marginTop: 8 }}>上传图片</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              ) : null}

              {/* 基础参数 */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="图片尺寸" name="size">
                    <Select defaultValue="2K">
                      <Option value="1K">1K (1024×1024)</Option>
                      <Option value="2K">2K (2048×2048)</Option>
                      <Option value="4K">4K (4096×4096)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                {(generateMode === 'text_to_images' || generateMode === 'image_to_images' || generateMode === 'images_to_images') && (
                  <Col span={12}>
                    <Form.Item label="生成数量" name="maxImages">
                      <Select defaultValue={4}>
                        <Option value={2}>2张</Option>
                        <Option value={3}>3张</Option>
                        <Option value={4}>4张</Option>
                        <Option value={5}>5张</Option>
                        <Option value={6}>6张</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                )}
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="水印" name="watermark" valuePropName="checked">
                    <Switch defaultChecked />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="返回格式" name="responseFormat">
                    <Select defaultValue="url">
                      <Option value="url">图片链接</Option>
                      <Option value="b64_json">Base64编码</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/* 高级参数 */}
              {advancedMode && (
                <>
                  <Divider>高级参数</Divider>
                  
                  <Form.Item label={`采样步数: ${form.getFieldValue('steps') || 30}`} name="steps">
                    <Slider min={1} max={60} />
                  </Form.Item>

                  <Form.Item label={`CFG Scale: ${form.getFieldValue('cfgScale') || 7}`} name="cfgScale">
                    <Slider min={1} max={15} step={0.5} />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="采样器" name="sampler">
                        <Select>
                          {samplerOptions.map((option) => (
                            <Option key={option.value} value={option.value}>
                              {option.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Clip Skip" name="clipSkip">
                        <InputNumber min={1} max={12} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item label="随机种子 (-1为随机)" name="seed">
                    <InputNumber min={-1} max={9999999999} style={{ width: '100%' }} />
                  </Form.Item>

                  {uploadedImage && (
                    <Form.Item label={`重绘幅度: ${form.getFieldValue('denoisingStrength') || 0.75}`} name="denoisingStrength">
                      <Slider min={0} max={1} step={0.05} />
                    </Form.Item>
                  )}
                </>
              )}

              {/* 操作按钮 */}
              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlayCircleOutlined />}
                    onClick={handleGenerate}
                    loading={loading}
                    disabled={loading}
                  >
                    {loading ? '生成中...' : '开始生成'}
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={resetForm}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* 右侧结果展示 */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <PictureOutlined />
                <span>生成结果</span>
              </Space>
            }
          >
            {loading && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Progress
                  type="circle"
                  percent={progress}
                  status="active"
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
                <div style={{ marginTop: '16px' }}>
                  <Text>正在生成图像...</Text>
                </div>
              </div>
            )}

            {!loading && generatedImages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                <PictureOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <div>生成的图像将在这里显示</div>
              </div>
            )}

            {generatedImages.length > 0 && (
              <div>
                <Title level={5}>生成完成</Title>
                <Row gutter={[8, 8]}>
                  {generatedImages.map((url, index) => (
                    <Col span={12} key={index}>
                      <Image
                        src={url}
                        alt={`Generated ${index + 1}`}
                        style={{ width: '100%', borderRadius: '8px' }}
                        preview={{
                          mask: '预览'
                        }}
                      />
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            {/* 模型信息 */}
            {selectedModel && (
              <div style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
                <Title level={5}>当前模型</Title>
                <div>
                  <Text strong>{selectedModel.name}</Text>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {selectedModel.description}
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <Tag color="blue">{selectedModel.baseAlgo}</Tag>
                    <Tag color={selectedModel.commercialUse ? 'green' : 'orange'}>
                      {selectedModel.commercialUse ? '支持商用' : '仅限个人'}
                    </Tag>
                    <Tag color="purple">{selectedModel.status}</Tag>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ModelInterface;