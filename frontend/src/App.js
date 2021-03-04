import React from 'react';

import Navigation from './features/navigation/Navigation';
import PipelineTable from './features/pipeline/PipelineTable';

import './App.css';

function App() {
  return (
    <div className="App">
      <Navigation>
        <PipelineTable />
      </Navigation>
    </div>
  );
}

export default App;