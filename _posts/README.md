# 文章分类目录结构

本博客采用多级分类目录结构来组织文章，便于管理和SEO优化。

## 📁 当前目录结构

```
source/_posts/
├── README.md                    # 目录结构说明
├── side-hustle/                 # 副业赚钱
│   └── mobile-apps/             # 手机赚钱应用
│       └── mobile-task-apps-review-shangbangzhuan-lezhuke.md
└── tech-tutorials/              # 技术教程
    └── web-development/         # Web开发
        └── hello-world.md
```

## 🎯 规划的分类框架

### `side-hustle/` - 副业赚钱
- `mobile-apps/` ✅ - 手机赚钱应用（已有内容）
- `online-earning/` - 网络赚钱方法
- `investment/` - 投资理财经验
- `freelance/` - 自由职业分享

### `app-reviews/` - App推荐
- `productivity/` - 效率工具
- `entertainment/` - 娱乐应用
- `tools/` - 实用工具
- `social/` - 社交应用

### `tech-tutorials/` - 技术教程
- `programming/` - 编程语言
- `web-development/` ✅ - Web开发（已有内容）
- `mobile-dev/` - 移动开发
- `devops/` - 运维部署

### `life-sharing/` - 生活分享
- `travel/` - 旅行见闻
- `food/` - 美食分享
- `thoughts/` - 生活感悟
- `hobbies/` - 兴趣爱好

## 📝 新建文章规则

### 创建新文章示例

```bash
# 现有分类的新文章
hexo new post "新赚钱app评测" --path side-hustle/mobile-apps/new-app-review
hexo new post "React教程" --path tech-tutorials/web-development/react-tutorial

# 新分类的文章（会自动创建目录）
hexo new post "投资心得" --path side-hustle/investment/investment-tips
hexo new post "效率工具推荐" --path app-reviews/productivity/productivity-tools
hexo new post "旅行攻略" --path life-sharing/travel/travel-guide
```

### 目录创建原则

- 📝 **有文章时创建** - 只有当有实际文章需要时才创建对应目录
- 🎯 **按需扩展** - 根据内容增长逐步完善分类结构  
- 🔄 **灵活调整** - 可根据实际使用情况调整分类方案

## 🎯 SEO优化

- 每个分类目录对应清晰的主题
- URL结构更加语义化
- 便于搜索引擎理解和收录
- 提升用户浏览体验

## 🔧 维护说明

- 新文章请放置在对应的分类目录中
- 文件名使用英文，便于URL生成
- 文章内容使用中文，提升用户体验
- 定期整理和优化分类结构
