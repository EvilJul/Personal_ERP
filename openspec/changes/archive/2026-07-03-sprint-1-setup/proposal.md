# Sprint 1: 项目初始化 + SQLite + Auth + Dashboard 骨架

## Why

Personal ERP 的核心价值是数据互通 + 统一 Dashboard。但没有项目骨架，后续所有功能都无法开始。Sprint 1 搭建地基：项目结构、数据层、认证、页面骨架。这是所有后续 Sprint 的前置依赖。

## 概述

Personal ERP 项目的第一阶段。搭建项目基础架构，实现核心数据层和认证，建立 Dashboard 页面骨架。

## 目标

1. Next.js 项目初始化（App Router + TypeScript + Tailwind）
2. SQLite + Drizzle ORM 数据层搭建
3. Auth 中间件（密码 → Cookie）
4. Dashboard 骨架页面 + API Routes 骨架
5. shadcn/ui 组件集成

## 背景

来自设计文档 `~/.gstack/projects/Personal_ERP/fusheng-unknown-design-20260702-155729.md`。
技术决策记录在 Obsidian `项目/Personal_ERP/技术方案/架构设计-20260702.md`。

## 成功标准

- `npm run dev` 可启动开发服务器
- `npm run typecheck` 无类型错误
- `npm run build` 构建成功
- 访问 Dashboard 页面可正常渲染
- 密码验证流程可工作
