# 🤖 BugSmash - Autonomous Bug Fixer

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://bugsmash-heysujals-projects.vercel.app)
[![Powered by Cline](https://img.shields.io/badge/Powered%20by-Cline%20AI-blue)](https://github.com/cline/cline)
[![AI Model](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-orange)](https://ai.google.dev/gemini-api)

> **Autonomous bug fixing powered by AI agents. Analyzes code issues, generates intelligent fixes, and creates pull requests automatically.**

Built for [AI Agents Assemble Hackathon](https://wemakedevs.org/hackathons) 🏆

---

## 🎯 Hackathon Submission Tracks

This project competes in **THREE tracks**:

### 🏆 **Infinity Gauntlet - Infinity Build Award **
- Uses **Cline CLI** to build autonomous coding workflows
- Intelligent code analysis and fix generation
- End-to-end automation from detection to PR creation

### ⚡ **Thor Stormbreaker - Deployment Award **  
- Production-ready deployment on **Vercel**
- Fast, responsive UI with real-time status updates
- Serverless API for workflow triggering

### 🛡️ **Captain America Shield - Code Award **
- Clean, well-documented open-source code
- **CodeRabbit** reviews all PRs automatically
- Professional GitHub workflows and documentation

---

## ✨ Features

🤖 **Autonomous Code Analysis**
- Scans repositories for ESLint issues automatically
- Intelligent issue prioritization and categorization

🧠 **AI-Powered Fixes**
- Powered by Google Gemini 2.5 Flash
- Context-aware code modifications
- Preserves code intent and structure

⚡ **Automated Workflow**
- One-click trigger from beautiful web interface
- GitHub Actions handles the entire pipeline
- Automatic PR creation with detailed descriptions

🔍 **Quality Assurance**
- CodeRabbit reviews all generated PRs
- ESLint validation before and after fixes
- Smart fallback mechanisms

---

## 🚀 Live Demo

### **Web Interface**
👉 **[bugsmash.vercel.app](https://bugsmash-heysujals-projects.vercel.app)**

### **Example Pull Requests**
- [PR #4 - Auto-fixed ESLint issues](https://github.com/heysujal/sample-eslint/pull/4)
- [PR #3 - Removed unused variables](https://github.com/heysujal/sample-eslint/pull/3)
- [CodeRabbit Review Example](https://github.com/heysujal/sample-eslint/pulls)

### **Video Demo**
🎥 **[Watch 2-minute demo](YOUR_LOOM_LINK)**

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Cline AI** | Autonomous coding agent for fix generation |
| **Gemini 2.5 Flash** | LLM for code analysis and modifications |
| **GitHub Actions** | Automated CI/CD pipeline |
| **Vercel** | Fast, global deployment platform |
| **CodeRabbit** | AI-powered code review |
| **Next.js 16** | Modern React framework |
| **Tailwind CSS** | Beautiful, responsive UI |
| **ESLint** | Code quality analysis |

---


### **How it works**

1. **Trigger** - User enters repo URL and clicks "Start Bug Fix"
2. **Analysis** - GitHub Action clones repo and runs ESLint
3. **AI Processing** - Cline AI analyzes issues with Gemini 2.5 Flash
4. **Fix Generation** - Smart fixes generated preserving code intent
5. **Validation** - Fixes verified with ESLint auto-fix fallback
6. **PR Creation** - Automatic pull request with detailed description
7. **Review** - CodeRabbit provides automated code review

---

## 🚦 Quick Start

### **Option 1: Use Web Interface**
1. Visit [bugsmash.vercel.app](https://bugsmash-heysujals-projects.vercel.app)
2. Enter your repository URL
3. Click "Start Autonomous Bug Fix"
4. Monitor progress on GitHub Actions

### **Option 2: Trigger via GitHub**
1. Go to [Actions tab](https://github.com/heysujal/bugsmash/actions/workflows/autonomous-fixer.yml)
2. Click "Run workflow"
3. Enter repository URL
4. Watch the magic happen!

---

## 📦 Local Development

```bash
# Clone the repository
git clone https://github.com/heysujal/bugsmash.git
cd bugsmash

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your GEMINI_API_KEY, GITHUB_TOKEN, PAT_TOKEN

# Run development server
npm run dev

# Open http://localhost:3000
```

### **Required Secrets**
- `GEMINI_API_KEY` - Google AI Studio API key
- `PAT_TOKEN` - GitHub Personal Access Token (repo + workflow scope)
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions

---

## 🎯 Use Cases

### **For Open Source Maintainers**
- Automatically fix common code quality issues
- Reduce time spent on trivial PR reviews
- Maintain consistent code style across contributors

### **For Development Teams**
- Catch and fix issues before code review
- Enforce coding standards automatically
- Speed up development cycles

### **For Solo Developers**
- Quick fixes for legacy codebases
- Learn from AI-generated improvements
- Focus on features, not formatting

---

## 🏗️ Architecture

### **Frontend (Vercel)**
- Next.js 16 with App Router
- Tailwind CSS for styling
- Serverless API routes
- Real-time status updates

### **Automation (GitHub Actions)**
- Workflow dispatch for manual triggers
- Ubuntu runner with Node.js 20
- Cline CLI integration
- Multi-step pipeline with fallbacks

### **AI Pipeline**
```
ESLint Analysis → Cline AI → Gemini 2.5 Flash → Code Generation → Validation
```

---

## 🎓 What I Learned

### **Technical Wins**
- Building production-grade AI agent workflows
- Integrating multiple AI services (Cline + Gemini)
- Implementing robust error handling and fallbacks
- Deploying serverless functions on Vercel

### **Challenges Overcome**
- GitHub Actions environment configuration
- Managing API rate limits and quotas
- Handling edge cases in code generation
- Ensuring code quality with automated validation

### **Best Practices Applied**
- Progressive enhancement (ESLint fallback → Manual fallback)
- Clear user feedback and status updates
- Comprehensive error logging
- Security-conscious secret management

---

## 🔮 Future Enhancements

- [ ] Support for multiple linting tools (Prettier, TypeScript)
- [ ] Custom fix templates and rules
- [ ] Batch processing for multiple repositories
- [ ] Analytics dashboard for fix history
- [ ] Integration with more AI models (Claude, GPT-4)
- [ ] Webhook support for automatic triggers
- [ ] Slack/Discord notifications

---

## Failures
- Couldn't make use of Kestra as its Docker image deployment was failing.