import './App.css';

function App() {
  return (
    <div className="App">
      <h2>Accessibility Widget Test</h2>
      <p>
        This is a long paragraph designed to test the accessibility widget features such as font adjustment, color change, theme toggle, and speech synthesis. Hover over this text to hear it being read aloud, or use the buttons in the widget to trigger manual playback. This content can help simulate real-world scenarios where screen readers or assistive tools are used for visually impaired users.
      </p>
      <accessibility-widget></accessibility-widget>
    </div>
  );
}

export default App;
