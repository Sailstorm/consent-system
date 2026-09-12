import { BrowserRouter, Routes, Route } from 'react-router-dom'

import PasswordGate from './components/PasswordGate'
import Home from './pages/Home'
import PolicyExample from './pages/PolicyExample'
import PrivacyAssistant from './pages/PrivacyAssistant'
import InvalidInput from './pages/InvalidInput'
import Processing from './pages/Processing'
import AnalysisFailed from './pages/AnalysisFailed'
import Explanation from './pages/Explanation'
import ConsentSummary from './pages/ConsentSummary'

import DataCollection from './pages/DataCollection'
import PurposeOfUse from './pages/PurposeOfUse'
import DataSharing from './pages/DataSharing'
import DataRetention from './pages/DataRetention'
import UserControl from './pages/UserControl'
import SourceDecision from './pages/SourceDecision'
import Settings from './pages/Settings'
import HelpPrivacy from './pages/HelpPrivacy'
import Accessibility from './pages/Accessibility'
import Privacy from './pages/Privacy'
import DataSources from './pages/DataSources'

function App() {
  return (
    <PasswordGate>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/policy-assistant/example"
            element={<PolicyExample />}
          />

          <Route
            path="/privacy-assistant"
            element={<PrivacyAssistant />}
          />

          <Route
            path="/invalid-input"
            element={<InvalidInput />}
          />

          <Route
            path="/processing"
            element={<Processing />}
          />

          <Route
            path="/analysis-failed"
            element={<AnalysisFailed />}
          />

          <Route
            path="/explanation"
            element={<Explanation />}
          />

          <Route
            path="/consent-summary"
            element={<ConsentSummary />}
          />

          <Route
            path="/data-collection"
            element={<DataCollection />}
          />

          <Route
            path="/purpose-of-use"
            element={<PurposeOfUse />}
          />

          <Route
            path="/data-sharing"
            element={<DataSharing />}
          />

          <Route
            path="/data-retention"
            element={<DataRetention />}
          />

          <Route
            path="/user-control"
            element={<UserControl />}
          />

          <Route
            path="/source-decision"
            element={<SourceDecision />}
          />

          <Route
            path="/accessibility"
            element={<Accessibility />}
          />

          <Route
            path="/privacy"
            element={<Privacy />}
          />

          <Route
            path="/data-sources"
            element={<DataSources />}
          />

          <Route path="/settings" element={<Settings />} />

          <Route path="/help-privacy" element={<HelpPrivacy />} />
        </Routes>
      </BrowserRouter>
    </PasswordGate>
  )
}

export default App