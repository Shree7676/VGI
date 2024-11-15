import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DisplayMap from './components/DisplayMap'
import Display from './components/Display'
import BusMap from './components/BusMap'
import BusMoving from './components/BusMoving';
import Test1 from './components/Test1';

function App() {

  return (
    <>
      <Router>
        <h1>VGI Bus Tracking Map</h1>
        <Routes>
          <Route path="/GTFS" element={<DisplayMap />} />
          <Route path="/SIRI" element={<BusMap />} />
          <Route path="/" element={<Test1 />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
