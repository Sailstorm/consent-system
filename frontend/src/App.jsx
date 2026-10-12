import { BrowserRouter, Routes, Route } from 'react-router-dom'

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

import NotFound from './pages/NotFound'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Homepage />} />

        {/* Privacy policy check */}
        <Route path="/privacy-assistant" element={<PrivacyAssistant />} />
        <Route path="/invalid-input" element={<InvalidInput />} />
        <Route path="/processing" element={<Processing />} />
        <Route path="/analysis-failed" element={<AnalysisFailed />} />
        <Route path="/explanation" element={<Explanation />} />
        <Route path="/consent-summary" element={<ConsentSummary />} />

        {/* One page per category */}
        <Route path="/data-collection" element={<DataCollection />} />
        <Route path="/purpose-of-use" element={<PurposeOfUse />} />
        <Route path="/data-sharing" element={<DataSharing />} />
        <Route path="/data-retention" element={<DataRetention />} />
        <Route path="/user-control" element={<UserControl />} />
        <Route path="/source-decision" element={<SourceDecision />} />

        {/* Learning */}
        <Route path="/privacy-learning" element={<Learn />} />
        <Route path="/privacy-learning/learn" element={<Learn />} />
        <Route path="/privacy-learning/learn/:topicId" element={<Learn />} />

        {/* Practice */}
        <Route path="/privacy-learning/practice" element={<Practice />} />
        <Route
          path="/privacy-learning/practice/:topicId/question"
          element={<PracticeScenario />}
        />

        {/* Data breaches */}
        <Route path="/risk-dashboard" element={<Dashboard />} />
        <Route path="/risk-dashboard/breaches" element={<RecentBreaches />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
