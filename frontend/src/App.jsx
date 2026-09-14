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

import LearningHome from './pages/LearningHome'
import Learn from './pages/Learn'
import Practice from './pages/Practice'
import PracticeScenario from './pages/PracticeScenario'
import PracticeReady from './pages/PracticeReady'
import PracticeFeedback from './pages/PracticeFeedback'
import PracticeSummary from './pages/PracticeSummary'
import Progress from './pages/Progress'
import LearningAbout from './pages/LearningAbout'

function App() {
  return (
    <PasswordGate>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
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

          {/* Iteration 2 */}
          <Route
            path="/privacy-learning"
            element={<LearningHome />}
          />

          {/* Learning */}
          <Route
            path="/privacy-learning/learn"
            element={<Learn />}
          />

          <Route
            path="/privacy-learning/learn/:topicId"
            element={<Learn />}
          />

          <Route
            path="/privacy-learning/learn/:topicId/activity"
            element={<Learn />}
          />

          {/* Practice */}
          <Route
            path="/privacy-learning/practice"
            element={<Practice />}
          />

          <Route
            path="/privacy-learning/practice/scenario/:scenarioNumber"
            element={<PracticeScenario />}
          />

          <Route
            path="/privacy-learning/practice/ready"
            element={<PracticeReady />}
          />

          <Route
            path="/privacy-learning/practice/feedback"
            element={<PracticeFeedback />}
          />

          <Route
            path="/privacy-learning/practice/summary"
            element={<PracticeSummary />}
          />

          <Route
            path="/privacy-learning/progress"
            element={<Progress />}
          />

          <Route
            path="/privacy-learning/about"
            element={<LearningAbout />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

          <Route
            path="/help-privacy"
            element={<HelpPrivacy />}
          />
        </Routes>
      </BrowserRouter>
    </PasswordGate>
  )
}

export default App