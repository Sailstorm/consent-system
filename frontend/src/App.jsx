import { BrowserRouter, Routes, Route } from 'react-router-dom'

import PasswordGate from './components/PasswordGate'

import Homepage from './pages/Homepage'

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

import Learn from './pages/Learn'
import Practice from './pages/Practice'
import PracticeScenario from './pages/PracticeScenario'

import Dashboard from './pages/Dashboard'
import RecentBreaches from './pages/RecentBreaches'

function App() {
  return (
    <PasswordGate>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          {/* Home */}
          <Route
            path="/"
            element={<Homepage />}
          />

          {/* Privacy Policy Analysis */}
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

          {/* Privacy Detail */}
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

          {/* Privacy Learning */}
          <Route
            path="/privacy-learning"
            element={<Learn />}
          />

          <Route
            path="/privacy-learning/learn"
            element={<Learn />}
          />

          <Route
            path="/privacy-learning/learn/:topicId"
            element={<Learn />}
          />

          {/* Practice */}
          <Route
            path="/privacy-learning/practice"
            element={<Practice />}
          />

          <Route
            path="/privacy-learning/practice/:topicId/question"
            element={<PracticeScenario />}
          />

          {/* Risk Dashboard */}
          <Route
            path="/risk-dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/risk-dashboard/breaches"
            element={<RecentBreaches />}
          />
        </Routes>
      </BrowserRouter>
    </PasswordGate>
  )
}

export default App