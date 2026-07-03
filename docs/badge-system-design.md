# Personal ERP 徽章系统设计

## 设计原则

1. **视觉层次**：铜 < 银 < 金 < 钻石，颜色和动效递进
2. **情感共鸣**：每个徽章都有故事，不只是数字
3. **动效仪式感**：解锁瞬间是高光时刻
4. **克制使用**：徽章稀有才有价值

## 色彩系统

```
铜牌: #CD7F32 → #B87333 (温暖铜色)
银牌: #C0C0C0 → #A8A9AD (冷调银色)
金牌: #FFD700 → #FFC107 (闪耀金色)
钻石: #B9F2FF → #E0F7FA (冰蓝钻石)
火焰: #FF6B35 → #FF4500 → #FF0000 (橙→红渐变)
```

## 动效技术方案

### CSS 动画（基础）
```css
@keyframes badge-unlock {
  0% { transform: scale(0) rotate(-180deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(10deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes glow-pulse {
  0%, 100% { filter: drop-shadow(0 0 5px currentColor); }
  50% { filter: drop-shadow(0 0 20px currentColor); }
}
```

### SVG 动画（复杂路径）
```svg
<!-- 进度环动画 -->
<circle cx="50" cy="50" r="40" 
  stroke-dasharray="251" 
  stroke-dashoffset="251"
  class="progress-ring" />

<style>
.progress-ring {
  animation: fill-ring 1s ease-out forwards;
}
@keyframes fill-ring {
  to { stroke-dashoffset: 0; }
}
</style>
```

### Canvas 粒子系统（高级）
```javascript
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = (Math.random() - 0.5) * 8;
    this.life = 1;
    this.color = color;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 0.02;
    this.vy += 0.1; // gravity
  }
  
  draw(ctx) {
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}
```

## 徽章解锁动画序列

```
1. 屏幕变暗（overlay）
2. 徽章从中心缩放出现（scale 0 → 1.2 → 1）
3. 光芒从徽章中心向外扩散
4. 粒子效果爆发
5. 徽章名称和描述淡入
6. "解锁！" 文字弹跳出现
7. 2秒后自动关闭，徽章进入收藏
```

## 数据模型

```typescript
// 用户徽章表
user_badges {
  id: text PK
  userId: text FK
  badgeId: text FK
  unlockedAt: integer (timestamp)
  progress: real (0-100)
}

// 徽章定义表
badges {
  id: text PK
  name: text NOT NULL
  category: text NOT NULL -- goal/habit/finance/cross/system/rare
  condition: text NOT NULL -- JSON condition
  icon: text NOT NULL -- emoji or SVG path
  description: text
  rarity: text -- common/rare/epic/legendary
}
```

## 展示位置

1. **Dashboard**：顶部徽章栏，展示最近解锁的 3 个
2. **个人中心**：完整徽章墙，按类别分组
3. **解锁弹窗**：实时解锁时的全屏动画
4. **目标/习惯详情**：相关徽章展示

## 优先级

### Phase 1（核心 10 个）
- 🌱 萌芽、🥈 银牌、🥇 金牌、💎 钻石
- ✨ 初次打卡、🔥 火焰之始、⚡ 雷霆习惯、👑 习惯之王
- 💰 第一桶金、🔗 首次联动

### Phase 2（扩展 20 个）
- 目标类全部
- 习惯类全部
- 财务类全部

### Phase 3（特殊 10 个）
- 跨模块联动
- 系统使用
- 特殊成就
