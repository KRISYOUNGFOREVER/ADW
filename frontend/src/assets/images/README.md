# 图片资源文件夹说明

## 文件夹结构

```
images/
├── carousel/                    # 主页轮播图
│   ├── slide1.jpg              # 轮播图1 (建议尺寸: 1920x600)
│   ├── slide2.jpg              # 轮播图2
│   └── slide3.jpg              # 轮播图3
│
└── products/                   # AI生成产品展示图
    ├── xiaomao/                # 小茅生图
    │   ├── product1.jpg        # 产品图片1 (建议尺寸: 300x300)
    │   ├── product2.jpg        # 产品图片2
    │   └── ...
    │
    ├── shangzuo/               # 上作花纸生图
    │   ├── product1.jpg
    │   ├── product2.jpg
    │   └── ...
    │
    ├── wangxuetao/             # 王雪涛生图
    │   ├── product1.jpg
    │   ├── product2.jpg
    │   └── ...
    │
    └── qixing/                 # 器型分类
        ├── pinmingbei/         # 品茗杯
        │   ├── cup1.jpg
        │   ├── cup2.jpg
        │   └── ...
        │
        ├── chayegan/           # 茶叶罐
        │   ├── jar1.jpg
        │   ├── jar2.jpg
        │   └── ...
        │
        └── chahu/              # 茶壶
            ├── pot1.jpg
            ├── pot2.jpg
            └── ...
```

## 图片规格建议

- **轮播图**: 1920x600px，JPG格式，文件大小控制在500KB以内
- **产品图**: 300x300px，JPG/PNG格式，文件大小控制在200KB以内
- **图片命名**: 使用英文和数字，避免中文和特殊字符

## 使用说明

1. 将对应的图片文件放入相应的文件夹中
2. 图片会自动被前端组件加载和展示
3. 支持常见的图片格式：JPG、PNG、WebP
4. 建议使用高质量的产品图片以获得最佳展示效果