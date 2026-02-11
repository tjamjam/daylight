import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import AuditTool from './tools/AuditTool'
import StripTool from './tools/StripTool'
import CompressTool from './tools/CompressTool'
import ResizeTool from './tools/ResizeTool'
import DownsizeTool from './tools/DownsizeTool'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/audit" element={<AuditTool />} />
        <Route path="/strip" element={<StripTool />} />
        <Route path="/compress" element={<CompressTool />} />
        <Route path="/resize" element={<ResizeTool />} />
        <Route path="/downsize" element={<DownsizeTool />} />
      </Route>
    </Routes>
  )
}
