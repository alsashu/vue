# source

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

# Railway Infrastructure Design Tool

A comprehensive, interactive platform for designing and optimizing railway systems using Vue.js 3, Pinia, and Konva.js. This tool empowers rail engineers with AI-powered design suggestions, real-time feedback, and multiple export formats including RailML.

## 🚀 Features

### Core Functionality

- **Interactive Canvas Editor** - Drag-and-drop railway components with real-time visual feedback
- **Multi-Module Design** - Five specialized modules for comprehensive railway planning
- **AI-Powered Assistance** - Intelligent design suggestions and layout optimization
- **Multi-Format Export** - Export to SVG, PDF, JSON, and RailML formats
- **Real-Time Collaboration** - Team-based design workflows with role-based access
- **Design Validation** - Automated compliance checking against railway standards

### Design Modules

1. **Track Plan Editor** - Interactive track layout design with switches, signals, and stations
2. **Input-Output Mapping** - Control system interfaces and signal mapping
3. **Wiring Diagram** - Electrical schematics and cable routing
4. **System Architecture** - High-level system design and component relationships
5. **Common Infrastructure Tools** - Shared utilities and component libraries

## 🛠️ Tech Stack

- **Frontend Framework**: Vue.js 3 with Composition API
- **State Management**: Pinia
- **Canvas Rendering**: Konva.js with vue-konva
- **UI Framework**: Bootstrap 5
- **HTTP Client**: Axios
- **Real-time Communication**: Socket.IO
- **Build Tool**: Vite
- **Authentication**: JWT-based with role management

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with Canvas support

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd railway-design-tool

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_AI_API_BASE_URL=http://localhost:8001/api/ai
VITE_SOCKET_URL=ws://localhost:8002
```

## 🏗️ Project Structure

```
railway-design-tool/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   │       └── main.css
│   │
│   ├── components/          # Atomic Design Structure
│   │   ├── atoms/           # Basic UI elements
│   │   │   ├── Button.vue
│   │   │   ├── Icon.vue
│   │   │   └── InputField.vue
│   │   │
│   │   ├── molecules/       # Component groups
│   │   │   ├── RailComponent.vue
│   │   │   ├── ComponentProperties.vue
│   │   │   └── TabHeader.vue
│   │   │
│   │   ├── organisms/       # Complex UI blocks
│   │   │   ├── RailCanvas.vue
│   │   │   ├── ComponentPalette.vue
│   │   │   ├── SegmentTabs.vue
│   │   │   └── HeaderBar.vue
│   │   │
│   │   ├── templates/       # Page layouts
│   │   │   ├── MainEditorLayout.vue
│   │   │   └── AuthLayout.vue
│   │   │
│   │   └── pages/           # Route components
│   │       ├── HomePage.vue
│   │       ├── EditorPage.vue
│   │       ├── LoginPage.vue
│   │       └── NotFound.vue
│   │
│   ├── modules/             # Feature modules
│   │   ├── track-editor/
│   │   ├── io-mapping/
│   │   ├── wiring-diagram/
│   │   ├── system-art/
│   │   └── common/
│   │
│   ├── stores/              # Pinia stores
│   │   ├── authStore.js
│   │   ├── designStore.js
│   │   └── aiStore.js
│   │
│   ├── services/            # Business logic
│   │   ├── authService.js
│   │   ├── aiService.js
│   │   └── exportService.js
│   │
│   ├── router/
│   │   └── index.js
│   │
│   ├── App.vue
│   └── main.js
│
├── package.json
├── vite.config.js
└── README.md
```

## 🎯 Usage

### Getting Started

1. **Login**: Use demo accounts or create a new account

   - Admin Demo: `admin@railway.com` / `admin123`
   - Engineer Demo: `engineer@railway.com` / `engineer123`

2. **Create Project**: Start with a new railway project or import existing designs

3. **Design Components**:

   - Drag components from the palette to the canvas
   - Use multiple segments for complex designs
   - Switch between different design modules

4. **AI Assistance**: Enable AI assistant for design suggestions and optimization

5. **Export**: Save designs in multiple formats (JSON, SVG, PDF, RailML)

### Keyboard Shortcuts

- `Ctrl+S` - Save project
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` - Redo
- `Ctrl+N` - New project
- `Del` - Delete selected component
- `F11` - Toggle fullscreen

### Component Types

#### Infrastructure

- **Track** - Basic railway track segments with configurable length and curves
- **Switch** - Track junctions with normal/reverse states
- **Signal** - Traffic control devices with multiple aspects (red/yellow/green)
- **Station** - Passenger/freight facilities with platforms
- **Platform** - Passenger boarding areas with safety features

#### Rolling Stock

- **Locomotive** - Self-propelled units with power specifications
- **Wagon** - Non-powered cars for freight/passenger service
- **Trainset** - Multiple unit trains with integrated power

#### Operational

- **Train Path** - Scheduled routes with timing constraints
- **Operating Period** - Service time windows and frequency
- **Routes** - Interlocked paths through junctions
- **Blocks** - Track occupation detection sections

## 🤖 AI Features

### Design Suggestions

- **Layout Optimization** - Improve track geometry and reduce construction costs
- **Safety Analysis** - Identify potential safety issues and suggest improvements
- **Capacity Planning** - Optimize for maximum throughput and efficiency
- **Standards Compliance** - Ensure designs meet railway engineering standards

### Smart Validation

- **Geometric Constraints** - Check minimum curve radii and grade limits
- **Signal Placement** - Verify proper signal spacing and visibility
- **Clearance Analysis** - Ensure adequate structure and vehicle clearances
- **Operational Feasibility** - Validate operational scenarios and conflicts

## 🔧 Configuration

### Canvas Settings

```javascript
// Default canvas configuration
{
  width: 1200,
  height: 800,
  gridSize: 20,
  snapToGrid: true,
  showGrid: true,
  zoom: { min: 0.1, max: 5.0, default: 1.0 }
}
```

### Component Libraries

Components are organized by type and loaded dynamically:

- Infrastructure components (tracks, switches, signals)
- Rolling stock templates
- Standard symbols and annotations
- Custom component definitions

### Export Formats

#### JSON Format

```json
{
  "project": {
    /* project metadata */
  },
  "segments": {
    /* design segments */
  },
  "components": {
    /* component data */
  },
  "metadata": {
    /* export info */
  }
}
```

#### RailML Export

Generates compliant RailML 3.1 XML with:

- Infrastructure topology
- Functional elements (signals, switches)
- Geometric definitions
- Operational data

## 🚦 Development

### Adding New Components

1. Define component schema in `designStore.js`
2. Create visual representation in `RailComponent.vue`
3. Add to component palette configuration
4. Implement specific behaviors and properties

### Custom Modules

1. Create module directory in `src/modules/`
2. Define module configuration
3. Implement module-specific components
4. Register in the main modules array

### API Integration

Services are organized by functionality:

- `authService.js` - Authentication and user management
- `aiService.js` - AI features and suggestions
- `exportService.js` - File operations and format conversion

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use Vue 3 Composition API
- Follow Atomic Design principles
- Implement TypeScript for new components
- Write comprehensive tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [https://docs.railway-designer.com](https://docs.railway-designer.com)
- **API Reference**: [https://api.railway-designer.com](https://api.railway-designer.com)
- **Issues**: [GitHub Issues](https://github.com/railway-design-tool/issues)
- **Discussions**: [GitHub Discussions](https://github.com/railway-design-tool/discussions)

## 🙏 Acknowledgments

- Vue.js team for the excellent framework
- Konva.js for powerful canvas capabilities
- Railway engineering community for domain expertise
- Open source contributors and maintainers

---

**Built with ❤️ for the railway engineering community**
