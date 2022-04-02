import MarkDownInput from './MarkDownInput/MarkDownInput.tsx'
import './App.css'

function App() {
  return (
    <div className="App">
      <MarkDownInput
        inputType="textarea"
        previewName="Preview"
        inputName="Description"
        preview={true}
      />
    </div>
  )
}

export default App
