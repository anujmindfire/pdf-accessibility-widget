import './App.css';

function App() {
  return (
    <div className="App" style={{ margin: 0, padding: 0, height: '100vh', overflow: 'auto' }}>
      <div id="pdf-viewer" style={{ width: '100%', paddingBottom: '100px' }}></div>
      <accessibility-widget></accessibility-widget>
    </div>
  );
}

export default App;
