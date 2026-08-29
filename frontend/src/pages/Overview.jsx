import Sidebar from '../components/Sidebar'
import '../styles/overview.css'

function Overview() {
  return (
    <div className="overview-page">
      <Sidebar activePage="overview" />

      <main className="overview-content">
        <div className="overview-top">
          <div>
            <h1>Your Privacy Hub</h1>
            <p>
              A simple place to understand privacy information, build AI awareness
              and explore digital risk.
            </p>
          </div>

          <div className="top-actions">
            <input
              type="text"
              className="search-box"
              placeholder="Search here"
            />

            <div className="user-chip">
              <span className="user-dot"></span>
              <span>Margaret</span>
            </div>
          </div>
        </div>

        <section className="feature-row">
          <div className="feature-card">
            <p className="feature-label">Privacy Assistant</p>
            <h3>Understand a Privacy Policy</h3>
            <p>
              Paste privacy text and get a clear, structured explanation.
            </p>
          </div>

          <div className="feature-card">
            <p className="feature-label">Learning</p>
            <h3>Learn Through Scenarios</h3>
            <p>
              Build privacy and AI awareness through short interactive activities.
            </p>
          </div>

          <div className="feature-card">
            <p className="feature-label">Explore</p>
            <h3>Explore Digital Risk</h3>
            <p>
              Use Australian privacy and consumer safety data to understand risk.
            </p>
          </div>
        </section>

        <section className="today-section">
          <h2>Today's Overview</h2>

          <div className="overview-grid">
            <div className="panel recent-panel">
              <div className="panel-title-row">
                <div>
                  <h3>Recent Privacy Summary</h3>
                  <p>Summary of your latest policy analysis</p>
                </div>

                <button className="small-button">
                  View full summary
                </button>
              </div>

              <div className="summary-list">
                <div>
                  <span>Data Collection</span>
                  <strong>Basic details only</strong>
                </div>

                <div>
                  <span>Purpose of Use</span>
                  <strong>Service + analytics</strong>
                </div>

                <div>
                  <span>Data Sharing</span>
                  <strong>Some partners</strong>
                </div>

                <div>
                  <span>Data Retention</span>
                  <strong>Not clearly stated</strong>
                </div>

                <div>
                  <span>User Control</span>
                  <strong>Some user rights</strong>
                </div>
              </div>
            </div>

            <div className="panel progress-panel">
              <h3>Learning Progress</h3>
              <p>Current level and learning status</p>

              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>

              <div className="progress-list">
                <div>
                  <span>Personal Data</span>
                  <strong>Complete</strong>
                </div>

                <div>
                  <span>Third-Party Sharing</span>
                  <strong>In progress</strong>
                </div>

                <div>
                  <span>AI & Personal Data</span>
                  <strong>Next</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Dashboard</h2>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <span>Privacy Categories</span>
              <strong>5 key categories</strong>
              <p>Collection, use, sharing, retention and control.</p>
            </div>

            <div className="dashboard-card">
              <span>Risk Overview</span>
              <strong>Trend view</strong>
              <p>Explore recent digital trust and privacy patterns.</p>
            </div>

            <div className="dashboard-card">
              <span>Digital Data</span>
              <strong>Source + update date</strong>
              <p>See where the displayed information comes from.</p>
            </div>

            <div className="dashboard-card chart-card">
              <span>Current pattern</span>

              <div className="mini-chart">
                <div className="bar bar-1"></div>
                <div className="bar bar-2"></div>
                <div className="bar bar-3"></div>
                <div className="bar bar-4"></div>
                <div className="bar bar-5"></div>
              </div>
            </div>
          </div>
        </section>

        <p className="overview-footer">
          Privacy information is provided to support understanding and does not
          make decisions for you.
        </p>
      </main>
    </div>
  )
}

export default Overview